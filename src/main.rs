#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

<<<<<<< HEAD
use blake2::{Blake2b, Blake2s, Digest};
use actix_cors::Cors;
use actix_web::{get, post, patch, middleware, web, App, HttpRequest, HttpResponse, HttpServer, Error};
=======
use actix_cors::Cors;
use actix_web::{get, middleware, web, App, HttpRequest, HttpResponse, HttpServer, Error};
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
use actix_files as fs;
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use dotenv;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};


<<<<<<< HEAD
mod schema_manual;
=======
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
<<<<<<< HEAD
        let res = model::FatStreamer::load(dbconn, id.0)?;
=======
        let res = model::Streamer::load(dbconn, id.0)?;
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

<<<<<<< HEAD
#[derive(Serialize, Deserialize)]
struct SimilarStreamersQuery {
    offset: Option<i64>,
}
#[get("/api/streamer/{id}/similar-streamers")]
async fn similar_streamers(dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>, query: web::Query<SimilarStreamersQuery>) -> Result<HttpResponse, error::Error> {
    let limit = config.item_num_per_similar_streamers;
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::SimilarStreamer::load(dbconn, id.0, limit, query.offset.unwrap_or(0))?;
=======
#[get("/api/streamer/{id}/similar-streamers")]
async fn similar_streamers(dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>) -> Result<HttpResponse, error::Error> {
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::SimilarStreamer::load(dbconn, id.0)?;
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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

<<<<<<< HEAD
sql_function!(fn lower(x: diesel::sql_types::Text) -> diesel::sql_types::Text);
#[derive(Serialize, Deserialize)]
struct ThinStreamerQuery {
    search: Option<String>,
    //#[serde(default, deserialize_with = "util::from_csv_opt")]
    ids: Option<Vec<i64>>,
}
#[get("/api/thin-streamers")]
async fn thin_streamers(req: HttpRequest, dbpool: web::Data<Pool>) -> Result<HttpResponse, error::Error> {
//async fn thin_streamers(dbpool: web::Data<Pool>, query: web::Query<ThinStreamerQuery>) -> Result<HttpResponse, error::Error> {
    let query: ThinStreamerQuery = serde_qs::Config::new(5, false).deserialize_str(&req.query_string()).map_err(|e| { error::Error::BadRequest })?;
=======
#[derive(Serialize, Deserialize)]
struct ThinStreamerQuery {
    search: Option<String>,
    #[serde(default, deserialize_with = "util::from_csv_opt")]
    ids: Option<Vec<i64>>,
}
#[get("/api/thin-streamers")]
async fn thin_streamers(dbpool: web::Data<Pool>, query: web::Query<ThinStreamerQuery>) -> Result<HttpResponse, error::Error> {
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = match (&query.search, &query.ids) {
            (Some(search), None) => schema::streamers::table
                .select((schema::streamers::id, schema::streamers::name, schema::streamers::profile_image_url, schema::streamers::is_streaming))
<<<<<<< HEAD
                .filter(lower(schema::streamers::name).like(format!("%{}%", search.to_lowercase())))
=======
                .filter(schema::streamers::name.like(format!("%{}%", search)))
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
                .limit(10)
                .load::<model::ThinStreamer>(dbconn)?,
            (None, Some(ids)) => schema::streamers::table
                .select((schema::streamers::id, schema::streamers::name, schema::streamers::profile_image_url, schema::streamers::is_streaming))
<<<<<<< HEAD
                .filter(schema::streamers::id.eq(diesel::pg::expression::dsl::any(ids)))
=======
                .filter(schema::streamers::id.eq_any(ids))
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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

<<<<<<< HEAD
#[derive(Serialize, Deserialize)]
struct CommentsQuery {
    offset: Option<i64>,
}
#[get("/api/streamer/{id}/comments")]
async fn comments(dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>, query: web::Query<CommentsQuery>) -> Result<HttpResponse, error::Error> {
    let comments_count = config.comment_num_per_page;
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::Comment::load_by_streamer_id(dbconn, id.0, comments_count, query.offset.unwrap_or(0))?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[get("/api/streamer/{id}/chatting/keywords")]
async fn streamer_recent_chatting_keywords(dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>,) -> Result<HttpResponse, error::Error> {
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::StreamerRecentChattingKeyword::load(dbconn, id.0)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[get("/api/streamer/{id}/subscriber/average-distribution")]
async fn streamer_average_subscriber_distribution(dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>,) -> Result<HttpResponse, error::Error> {
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::StreamersAverageSubscriberDistribution::load(dbconn, id.0)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[derive(Serialize, Deserialize)]
struct RandkingQuery {
    offset: i64,
    order_by: String,
    desc: Option<bool>,
}
#[get("/api/streamer-ranking")]
async fn streamer_ranking(dbpool: web::Data<Pool>, config: web::Data<Config>, query: web::Query<RandkingQuery>) -> Result<HttpResponse, error::Error> {
    let num = config.item_num_per_ranking_req;
    let RandkingQuery{ offset, order_by, desc } = query.into_inner();
    let desc = desc.unwrap_or(true);
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::FatStreamerRanking::load(dbconn, num, offset, order_by, desc)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}


#[derive(Serialize, Deserialize)]
struct WriteCommentQuery {
    nickname: String,
    password: String,
    contents: String,
    parent_id: Option<i32>,
}
#[post("/api/streamer/{id}/comments")]
async fn write_comment(req: HttpRequest, dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>, query: web::Json<WriteCommentQuery>) -> Result<HttpResponse, error::Error> {
    let peer_addr_bytes: Vec<u8> = match req.peer_addr().ok_or(error::Error::BadRequest)? {
        std::net::SocketAddr::V4(addr) => addr.ip().octets().to_vec(),
        std::net::SocketAddr::V6(addr) => addr.ip().segments().iter().map(|i| i.to_le_bytes().to_vec()).flatten().map(|i| i.clone()).collect::<Vec<u8>>(),
    };
    let WriteCommentQuery {
        nickname,
        password,
        contents,
        parent_id,
    } = query.into_inner();
    web::block(move || -> Result<(), error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        (model::NewComment{
            streamer_id: id.0,
            password: 
                Blake2b::new()
                .chain(password.as_str())
                .result().to_vec(),
            contents,
            fingerprint_hash: 
                Blake2b::new()
                .chain(peer_addr_bytes)
                .result().to_vec(),
            nickname,
            parent_id,
        }).write(dbconn)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().finish())
}

#[derive(Serialize, Deserialize)]
struct VoteCommentQuery {
    upvote: bool,
    id: i32,
}
#[patch("/api/streamer/{id}/comments")]
async fn vote_comment(req: HttpRequest, dbpool: web::Data<Pool>, config: web::Data<Config>, id: web::Path<(i64,)>, query: web::Json<VoteCommentQuery>) -> Result<HttpResponse, error::Error> {
    let peer_addr_bytes: Vec<u8> = match req.peer_addr().ok_or(error::Error::BadRequest)? {
        std::net::SocketAddr::V4(addr) => addr.ip().octets().to_vec(),
        std::net::SocketAddr::V6(addr) => addr.ip().segments().iter().map(|i| i.to_le_bytes().to_vec()).flatten().map(|i| i.clone()).collect::<Vec<u8>>(),
    };
    let VoteCommentQuery {
        upvote,
        id,
    } = query.into_inner();
    web::block(move || -> Result<(), error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        model::Comment::vote(
            dbconn, 
            id, 
            Blake2b::new()
                .chain(peer_addr_bytes)
                .result().to_vec(),
            upvote)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().finish())
}

#[get("/api/me/fingerprint-hash")]
async fn fingerprint_hash(req: HttpRequest, config: web::Data<Config>) -> Result<HttpResponse, error::Error> {
    let comments_count = config.comment_num_per_page;
    let peer_addr_bytes: Vec<u8> = match req.peer_addr().ok_or(error::Error::BadRequest)? {
        std::net::SocketAddr::V4(addr) => addr.ip().octets().to_vec(),
        std::net::SocketAddr::V6(addr) => addr.ip().segments().iter().map(|i| i.to_le_bytes().to_vec()).flatten().map(|i| i.clone()).collect::<Vec<u8>>(),
    };
    Ok(HttpResponse::Ok().body(
        serde_cbor::to_vec(
            &Blake2b::new()
            .chain(peer_addr_bytes)
            .result().to_vec())?))
}

#[derive(Serialize, Deserialize)]
struct ViewerMigrationCountQuery {
    id1: i64,
    id2: i64,
    from: chrono::DateTime<chrono::Utc>,
    to: chrono::DateTime<chrono::Utc>,
}
#[get("/api/viewer-migrations")]
async fn viewer_migration_count(dbpool: web::Data<Pool>, config: web::Data<Config>, query: web::Query<ViewerMigrationCountQuery>) -> Result<HttpResponse, error::Error> {
    let ViewerMigrationCountQuery{ id1, id2, from, to } = query.into_inner();
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::ViewerMigrationCount::load(dbconn, id1, id2, from, to)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[derive(Serialize, Deserialize)]
struct MigrationRankingQuery {
    offset: i64,
}
#[get("/api/viewer-migration-ranking")]
async fn viewer_migration_count_ranking(dbpool: web::Data<Pool>, config: web::Data<Config>, query: web::Query<MigrationRankingQuery>) -> Result<HttpResponse, error::Error> {
    let num = config.item_num_per_ranking_req;
    let MigrationRankingQuery{ offset } = query.into_inner();
    web::block(move || -> Result<Vec<u8>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        let res = model::ViewerMigrationCountRanking::load(dbconn, num, offset)?;
        Ok(serde_cbor::to_vec(&res)?)
    })
    .await
    .map_err(error::Error::from)
    .map(|res| HttpResponse::Ok().body(res))
}

#[derive(Clone)]
struct Config {
    recent_duration: chrono::Duration,
    comment_num_per_page: i64,
    item_num_per_ranking_req: i64,
    item_num_per_similar_streamers: i64,
=======
#[derive(Clone)]
struct Config {
    recent_duration: chrono::Duration,
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
<<<<<<< HEAD
    let recent_duration: i64 = std::env::var("RECENT_DURATION").unwrap_or("604800".to_string()).parse().unwrap();
=======
    let recent_duration: i64 = std::env::var("RECENT_DURATION").expect("RECENT_DURATION").parse().unwrap();
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
    let private_key = std::env::var("PRIVATE_KEY").expect("PRIVATE_KEY");
    let cert = std::env::var("CERT").expect("CERT");
    
    let data = Config{
        recent_duration: chrono::Duration::seconds(recent_duration),
<<<<<<< HEAD
        comment_num_per_page: std::env::var("COMMENT_NUM_PER_PAGE").unwrap_or("10".to_string()).parse().unwrap(),
        item_num_per_ranking_req: std::env::var("ITEM_NUM_PER_RANKING_REQ").unwrap_or("10".to_string()).parse().unwrap(),
        item_num_per_similar_streamers: std::env::var("ITEM_NUM_PER_RANKING_REQ").unwrap_or("10".to_string()).parse().unwrap(),
=======
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
<<<<<<< HEAD
            .service(comments)
            .service(write_comment)
            .service(vote_comment)
            .service(fingerprint_hash)
            .service(streamer_recent_chatting_keywords)
            .service(streamer_average_subscriber_distribution)
            .service(streamer_ranking)
            .service(viewer_migration_count)
            .service(viewer_migration_count_ranking)
=======
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
