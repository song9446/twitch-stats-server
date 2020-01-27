#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

use actix_cors::Cors;
use actix_web::{get, middleware, web, App, HttpRequest, HttpResponse, HttpServer, Error};
use actix_files as fs;
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use dotenv;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};


mod schema;
mod model;
mod error;
mod util;

#[derive(Serialize, Deserialize)]
struct ErrorResponse {
    error_message: String,
    error_code: i32,
}


pub type Pool = r2d2::Pool<ConnectionManager<PgConnection>>;


#[get("/api/streamer-map")]
async fn streamer_map(dbpool: web::Data<Pool>) -> Result<HttpResponse, error::Error> {
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::StreamerMapElement::load(dbconn)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[get("/api/streamer/{id}")]
async fn streamer(dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>) -> Result<HttpResponse, error::Error> {
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::Streamer::load(dbconn, id.0)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[get("/api/streamer/{id}/similar-streamers")]
async fn similar_streamers(dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>) -> Result<HttpResponse, error::Error> {
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::SimilarStreamer::load(dbconn, id.0)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[derive(Serialize, Deserialize)]
struct TimelineQuery {
    from: chrono::DateTime<chrono::Utc>,
    to: chrono::DateTime<chrono::Utc>,
}
#[get("/api/streamer/{id}/timeline")]
async fn timeline(dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>, query: web::Query<TimelineQuery>) -> Result<HttpResponse, error::Error> {
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::Timeline::load(dbconn, id.0, query.from, query.to)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[derive(Serialize, Deserialize)]
struct ThinStreamerQuery {
    search: Option<String>,
    #[serde(default, deserialize_with = "util::from_csv_opt")]
    ids: Option<Vec<i64>>,
}
#[get("/api/thin-streamers")]
async fn thin_streamers(dbpool: web::Data<Pool>, query: web::Query<ThinStreamerQuery>) -> Result<HttpResponse, error::Error> {
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = match (&query.search, &query.ids) {
            (Some(search), None) => schema::streamers::table
                .select((schema::streamers::id, schema::streamers::name, schema::streamers::profile_image_url, schema::streamers::is_streaming))
                .filter(schema::streamers::name.like(format!("%{}%", search)))
                .limit(10)
                .load::<model::ThinStreamer>(dbconn)?,
            (None, Some(ids)) => schema::streamers::table
                .select((schema::streamers::id, schema::streamers::name, schema::streamers::profile_image_url, schema::streamers::is_streaming))
                .filter(schema::streamers::id.eq_any(ids))
                .load::<model::ThinStreamer>(dbconn)?,
            _ => return Err(error::Error::BadRequest),
        }; 
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[derive(Serialize, Deserialize)]
struct StreamRangesQuery {
    from: chrono::DateTime<chrono::Utc>,
    to: chrono::DateTime<chrono::Utc>,
}
#[get("/api/streamer/{id}/stream-ranges")]
async fn stream_ranges(dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>, query: web::Query<StreamRangesQuery>) -> Result<HttpResponse, error::Error> {
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::StreamRange::load(dbconn, id.0, query.from, query.to)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[derive(Clone)]
struct Config {
    recent_duration: chrono::Duration,
}
#[actix_rt::main]
async fn main() {
    dotenv::dotenv().ok();
    env_logger::init();

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL");
    let manager = ConnectionManager::<PgConnection>::new(db_url);
    let dbpool = r2d2::Pool::builder().build(manager).expect("Failed to create pool.");
    let host_address = std::env::var("HOST_ADDRESS").expect("HOST_ADDRESS");
    let host_url = std::env::var("HOST_URL").expect("HOST_URL");
    let allow_origins = std::env::var("ALLOW_ORIGINS").expect("ALLOW_ORIGINS");
    /*let allow_origins = std::env::var("ALLOW_ORIGINS").expect("ALLOW_ORIGINS")
        .split_whitespace();
        .fold(Cors::new(), |a, b| {
            a.allowed_origin(b)
        }).finish();*/
    let recent_duration: i64 = std::env::var("RECENT_DURATION").expect("RECENT_DURATION").parse().unwrap();
    let private_key = std::env::var("PRIVATE_KEY").expect("PRIVATE_KEY");
    let cert = std::env::var("CERT").expect("CERT");
    
    let data = Config{
        recent_duration: chrono::Duration::seconds(recent_duration),
    };

    let mut ssl_builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    ssl_builder
        .set_private_key_file(private_key, SslFiletype::PEM)
        .unwrap();
    ssl_builder.set_certificate_chain_file(cert).unwrap();

    HttpServer::new(move || {
        App::new()
            //.wrap(middleware::DefaultHeaders::new().header("X-Version", "0.2"))
            .data(dbpool.clone())
            .data(data.clone())
            .wrap(allow_origins.clone().split_whitespace().fold(Cors::new(), |a, b| {
                a.allowed_origin(b)
            }).finish())
            //.wrap(allow_origins.clone())
            .wrap(middleware::Compress::default())
            .wrap(middleware::Logger::default())
            .service(streamer)
            .service(streamer_map)
            //.service(streamers)
            .service(thin_streamers)
            .service(similar_streamers)
            .service(timeline)
            .service(stream_ranges)
            /*.default_service(
                fs::Files::new("/", "./sapper/__sapper__/export/").index_file("index.html"),
                )*/
            //.service(web::resource("/api/streamer").route(web::get().to(streamer)))
    })
    .bind_openssl(host_address, ssl_builder).unwrap()
        .workers(1)
        .run()
        .await.unwrap();
}
