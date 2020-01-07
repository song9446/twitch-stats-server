use diesel::prelude::*;
use diesel::RunQueryDsl;
use diesel::QueryDsl;
use diesel::{r2d2::ConnectionManager, PgConnection};
use super::schema;
use super::error;
pub type Pool = r2d2::Pool<ConnectionManager<PgConnection>>;


#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct ThinStreamer {
    pub id: i64,
    pub name: String,
    pub profile_image_url: Option<String>,
    pub is_streaming: bool,
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerTsnePos {
    pub streamer_id: i64,
    pub x: i32,
    pub y: i32,
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerSimilarity {
    pub subject: i64,
    pub object: i64,
    pub ratio: f64,
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerCluster {
    pub streamer_id: i64,
    pub cluster: i32,
    pub probability: f64,
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerViewerCountChange {
    pub streamer_id: i64,
    pub view_count: i32,
    pub time: chrono::DateTime<chrono::Utc>,
}
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerChatterCountChange {
    pub streamer_id: i64,
    pub chatter_count: i32,
    pub time: chrono::DateTime<chrono::Utc>,
}
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerFollowerCountChange {
    pub streamer_id: i64,
    pub follower_count: i32,
    pub time: chrono::DateTime<chrono::Utc>,
}



joinable!(schema::streamer_tsne_pos -> schema::streamer_clusters (streamer_id));
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerMapElement {
    pub id: i64,
    pub name: String,
    pub profile_image_url: Option<String>,
    pub is_streaming: bool,
    pub x: i32,
    pub y: i32,
    pub cluster: i32,
    pub probability: f64,
    //pub is_streaming: bool,
}
impl StreamerMapElement {
    pub fn load(dbconn: &PgConnection) -> Result<Vec<StreamerMapElement>, error::Error> {
        use schema::streamer_tsne_pos::dsl::*;
        use schema::streamers::dsl::*;
        use schema::streamer_clusters::dsl::*;
        Ok(streamer_tsne_pos
            .left_join(streamer_clusters)
            .inner_join(streamers)
            .select((id, name, profile_image_url, is_streaming, x, y, cluster, probability))
            .load::<StreamerMapElement>(dbconn)?)
    }
}


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
pub struct ThinStreamerWithSimilarity {
    pub id: i64,
    pub name: String,
    pub profile_image_url: Option<String>,
    pub is_streaming: bool,
    pub similarity: f64,
}
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct Game {
    pub id: i64,
    pub name: Option<String>,
    pub box_art_url: Option<String>,
}
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerStreamMetadataChange {
    pub streamer_id: i64,
    pub game_id: Option<i64>,
    pub language: Option<String>,
    pub title: Option<String>,
    pub started_at: Option<chrono::DateTime<chrono::Utc>>,
    pub time: chrono::DateTime<chrono::Utc>,
}
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerStreamMetadataChangeWithGame {
    pub language: Option<String>,
    pub title: Option<String>,
    pub started_at: Option<i64>,
    pub time: i64,
    pub game: Option<Game>,
}
#[derive(Serialize, Debug)]
pub struct StreamerWithStatistics {
    streamer: Streamer,
    viewer_count_changes: Vec<(i64, i32)>,
    chatter_count_changes: Vec<(i64, i32)>,
    follower_count_changes: Vec<(i64, i32)>,
    stream_metadata_changes: Vec<StreamerStreamMetadataChangeWithGame>,
    similar_streamers: Vec<ThinStreamerWithSimilarity>,
    //similar_streamers: Vec<ThinStreamerWithSimilarity>,
}
impl StreamerWithStatistics {
    pub fn load(dbconn: &PgConnection, id: i64, recent: chrono::DateTime<chrono::Utc>) -> Result<StreamerWithStatistics, error::Error> {
        let streamer = schema::streamers::table
            .filter(schema::streamers::id.eq(id))
            .first::<Streamer>(dbconn)?;
        let viewer_count_changes = {
            use schema::streamer_viewer_count_changes::dsl::*;
            streamer_viewer_count_changes
                .select((time, viewer_count))
                .filter(streamer_id.eq(id).and(time.gt(&recent)))
                .order(time.asc())
                .load::<(chrono::DateTime<chrono::Utc>, i32)>(dbconn)
        }?;
        let viewer_count_changes = viewer_count_changes.into_iter().map(|(time, count)| (time.timestamp(), count)).collect();
        let chatter_count_changes = {
            use schema::streamer_chatter_count_changes::dsl::*;
            streamer_chatter_count_changes
                .select((time, chatter_count))
                .filter(streamer_id.eq(id).and(time.gt(&recent)))
                .order(time.asc())
                .load::<(chrono::DateTime<chrono::Utc>, i32)>(dbconn)
        }?;
        let chatter_count_changes = chatter_count_changes.into_iter().map(|(time, count)| (time.timestamp(), count)).collect();
        let follower_count_changes = {
            use schema::streamer_follower_count_changes::dsl::*;
            streamer_follower_count_changes
                .select((time, follower_count))
                .filter(streamer_id.eq(id).and(time.gt(&recent)))
                .order(time.asc())
                .load::<(chrono::DateTime<chrono::Utc>, i32)>(dbconn)
        }?;
        let follower_count_changes = follower_count_changes.into_iter().map(|(time, count)| (time.timestamp(), count)).collect();
        let stream_metadata_changes = {
            use schema::streamer_stream_metadata_changes::dsl::*;
            streamer_stream_metadata_changes
                .left_join(schema::games::table)
                .filter(streamer_id.eq(id).and(time.gt(&recent)))
                .order(time.asc())
                .load::<(StreamerStreamMetadataChange, Option<Game>)>(dbconn)
        }?;
        let stream_metadata_changes = stream_metadata_changes.into_iter().map(|(metadata_change, game)| StreamerStreamMetadataChangeWithGame {
            language: metadata_change.language,
            title: metadata_change.title,
            started_at: metadata_change.started_at.map(|t| t.timestamp()),
            time: metadata_change.time.timestamp(),
            game: game }).collect();
        /*let similar_streamers = schema::streamer_similarities::table
            .left_join(schema::streamers::table.on(schema::streamers::))
            .select((schema::streamer_similarities::object, schema::streamer::similarities::ratio))
            .filter(schema::streamer_similarities::subject.eq(id.0))
            .order(schema::streamer_similarities::ratio.desc())
            .load::<(i64, f32)>(dbconn)?;*/
        let similar_streamers = {
            use schema::streamer_similarities::dsl::*;
            streamer_similarities
                .inner_join(schema::streamers::table.on(schema::streamers::id.eq(object)))
                .select((schema::streamers::id, schema::streamers::name, schema::streamers::profile_image_url, schema::streamers::is_streaming, ratio))
                .filter(subject.eq(id).and(subject.ne(object)))
                .order(ratio.desc())
                .limit(10)
                .load::<ThinStreamerWithSimilarity>(dbconn)
        }?;
        Ok(StreamerWithStatistics{
            streamer, 
            viewer_count_changes, 
            chatter_count_changes, 
            follower_count_changes, 
            stream_metadata_changes,
            similar_streamers})

    }
}
