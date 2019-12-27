#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

//use anyhow::{Result};
use actix_web::{get, middleware, web, App, HttpRequest, HttpResponse, HttpServer, Error};
use actix_files as fs;
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use dotenv;

mod schema;
mod model;
mod error;

#[derive(Serialize, Deserialize)]
struct ErrorResponse {
    error_message: String,
    error_code: i32,
}


pub type Pool = r2d2::Pool<ConnectionManager<PgConnection>>;

#[get("/api/streamer/{id}")]
async fn streamer(req: HttpRequest, id: web::Path<i64>) -> Result<HttpResponse, Error> {
    println!("REQ: {:?}", req);
    Ok(HttpResponse::Ok().json(""))
}

#[get("/api/streamer-tsne-grid")]
async fn streamers_tsne_grid(dbpool: web::Data<Pool>) -> Result<HttpResponse, Error> {
    Ok(web::block(move || -> Result<Vec<model::StreamerTsnePos>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        Ok(schema::streamer_tsne_pos::table
            .load::<model::StreamerTsnePos>(dbconn)?)
    })
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(error::Error::from)
    .unwrap_or_else(|err| HttpResponse::Ok().json(err)))
}

#[get("/api/streamers")]
async fn streamers(dbpool: web::Data<Pool>) -> Result<HttpResponse, Error> {
    Ok(web::block(move || -> Result<Vec<model::Streamer>, error::Error> {
        let dbconn: &PgConnection = &*dbpool.get()?;
        Ok(schema::streamers::table
            .load::<model::Streamer>(dbconn)?)
    })
    .await
    .map(|res| HttpResponse::Ok().json(res))
    .map_err(error::Error::from)
    .unwrap_or_else(|err| HttpResponse::Ok().json(err)))
}

#[actix_rt::main]
async fn main() -> anyhow::Result<()> {
    dotenv::dotenv().ok();
    env_logger::init();

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL");
    let manager = ConnectionManager::<PgConnection>::new(db_url);
    let dbpool = r2d2::Pool::builder().build(manager).expect("Failed to create pool.");
    let host_address = std::env::var("HOST_ADDRESS").expect("HOST_ADDRESS");

    HttpServer::new(move || {
        App::new()
            //.wrap(middleware::DefaultHeaders::new().header("X-Version", "0.2"))
            .data(dbpool.clone())
            .wrap(middleware::Compress::default())
            .wrap(middleware::Logger::default())
            .service(streamers)
            .service(streamers_tsne_grid)
            .default_service(
                fs::Files::new("/", "./web/public").index_file("index.html"),
            )
            //.service(web::resource("/api/streamer").route(web::get().to(streamer)))
            /*.service(
                web::resource("/resource2/index.html")
                .default_service(
                    web::route().to(|| HttpResponse::MethodNotAllowed()),
                    )
                .route(web::get().to(index_async)),
                )
            .service(web::resource("/test1.html").to(|| async { "Test\r\n" }))*/
    })
    .bind(host_address)?
    .workers(1)
    .run()
    .await?;
    Ok(())
}
