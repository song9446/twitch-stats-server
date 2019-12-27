use diesel::prelude::*;
use diesel::RunQueryDsl;
use diesel::QueryDsl;
use diesel::{r2d2::ConnectionManager, PgConnection};
use super::schema;
pub type Pool = r2d2::Pool<ConnectionManager<PgConnection>>;

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct Streamer {
    pub id: i64,
    pub name: String,
    pub login: String,
    pub profile_image_url: Option<String>,
    pub offline_image_url: Option<String>,
    pub broadcaster_type: Option<String>,
    pub description: Option<String>,
    pub type_: Option<String>,
    pub is_streaming: bool,
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerTsnePos {
    pub streamer_id: i64,
    pub x: i32,
    pub y: i32,
}
