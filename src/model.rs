use diesel::prelude::*;
use diesel::RunQueryDsl;
use diesel::QueryDsl;
use diesel::sql_types::*;
use diesel::{r2d2::ConnectionManager, PgConnection};
use std::collections::Bound;
use super::schema;
use super::schema::stream_ranges;
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



#[derive(Serialize, Deserialize, Queryable, QueryableByName, Associations, Debug)]
pub struct StreamerMapElement {
    #[sql_type = "Int8"]
    pub id: i64,
    #[sql_type = "Text"]
    pub name: String,
    #[sql_type = "Nullable<Text>"]
    pub profile_image_url: Option<String>,
    #[sql_type = "Int4"]
    pub average_viewer_count: i32,
    #[sql_type = "Bool"]
    pub is_streaming: bool,
    #[sql_type = "Int4"]
    pub x: i32,
    #[sql_type = "Int4"]
    pub y: i32,
    #[sql_type = "Int4"]
    pub cluster: i32,
    #[sql_type = "Float8"]
    pub probability: f64,
    #[sql_type = "Float8"]
    pub chatting_speed: f64,
}
impl StreamerMapElement {
    pub fn load(dbconn: &PgConnection) -> Result<Vec<StreamerMapElement>, error::Error> {
       Ok(diesel::sql_query(r#"
        SELECT id, name, profile_image_url, average_viewer_count, is_streaming, x, y, cluster, probability, chatting_speed 
            FROM streamer_tsne_pos stp 
                LEFT JOIN streamer_clusters sc ON stp.streamer_id = sc.streamer_id 
                INNER JOIN streamers s ON s.id = stp.streamer_id
                INNER JOIN LATERAL (SELECT chatting_speed FROM stream_changes sc2 WHERE stp.streamer_id = sc2.streamer_id ORDER BY sc2.time DESC LIMIT 1) cs ON true
        "#).load(dbconn)?)
           /*
        use schema::streamer_tsne_pos::dsl::*;
        use schema::streamers::dsl::*;
        use schema::streamer_clusters::dsl::*;
        Ok(streamer_tsne_pos
            .left_join(streamer_clusters)
            .inner_join(streamers)
            .select((id, name, profile_image_url, average_viewer_count, is_streaming, x, y, cluster, probability))
            .load::<StreamerMapElement>(dbconn)?)
            */
    }
}
/*
joinable!(schema::streamer_tsne_pos -> schema::streamer_clusters (streamer_id));
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerMapElement {
    pub id: i64,
    pub name: String,
    pub profile_image_url: Option<String>,
    pub average_viewer_count: i32,
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
            .select((id, name, profile_image_url, average_viewer_count, is_streaming, x, y, cluster, probability))
            .load::<StreamerMapElement>(dbconn)?)
    }
}
*/


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
    pub average_viewer_count: i32,
}
impl Streamer {
    pub fn load(dbconn: &PgConnection, id: i64) -> Result<Streamer, error::Error> {
        Ok(schema::streamers::table
            .filter(schema::streamers::id.eq(id))
            .first::<Streamer>(dbconn)?)
    }
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct SimilarStreamer {
    pub id: i64,
    pub name: String,
    pub profile_image_url: Option<String>,
    pub is_streaming: bool,
    pub similarity: f64,
}
impl SimilarStreamer {
    pub fn load(dbconn: &PgConnection, subject_id: i64) -> Result<Vec<SimilarStreamer>, error::Error> {
        use schema::streamer_similarities::dsl::*;
        use schema::streamers::dsl::*;
        Ok(streamer_similarities
                .inner_join(streamers.on(id.eq(object)))
                .select((id, name, profile_image_url, is_streaming, ratio))
                .filter(subject.eq(subject_id).and(subject.ne(object)))
                .order(ratio.desc())
                .limit(10)
                .load::<SimilarStreamer>(dbconn)?)
    }
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct Game {
    pub id: i64,
    pub name: Option<String>,
    pub box_art_url: Option<String>,
}
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamMetadataChange {
    pub streamer_id: i64,
    pub game_id: Option<i64>,
    pub language: String,
    pub title: String,
    pub started_at: chrono::DateTime<chrono::Utc>,
    pub time: chrono::DateTime<chrono::Utc>,
}
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamMetadataChangeWithGame {
    pub language: String,
    pub title: String,
    pub started_at: i64,
    pub time: i64,
    pub game: Option<Game>,
}
#[derive(Serialize, Debug)]
pub struct Timeline {
    stream_changes: Vec<(i64, i32, i32, i32, f64)>,
    stream_metadata_changes: Vec<StreamMetadataChangeWithGame>,
}
impl Timeline {
    pub fn load(dbconn: &PgConnection, id: i64, from: chrono::DateTime<chrono::Utc>, to: chrono::DateTime<chrono::Utc>) -> Result<Timeline, error::Error> {
        let stream_changes = {
            use schema::stream_changes::dsl::*;
            let mut last = stream_changes
                .select((time, viewer_count, chatter_count, follower_count, chatting_speed))
                .filter(streamer_id.eq(id).and(time.lt(&from)))
                .order(time.desc())
                .limit(1)
                .load::<(chrono::DateTime<chrono::Utc>, i32, i32, i32, f64)>(dbconn)?;
            let mut changes = stream_changes
                .select((time, viewer_count, chatter_count, follower_count, chatting_speed))
                .filter(streamer_id.eq(id).and(time.ge(&from).and(time.lt(&to))))
                .order(time.asc())
                .load::<(chrono::DateTime<chrono::Utc>, i32, i32, i32, f64)>(dbconn)?;
            let mut next = stream_changes
                .select((time, viewer_count, chatter_count, follower_count, chatting_speed))
                .filter(streamer_id.eq(id).and(time.ge(&to)))
                .order(time.asc())
                .limit(1)
                .load::<(chrono::DateTime<chrono::Utc>, i32, i32, i32, f64)>(dbconn)?;
            last.append(&mut changes);
            last.append(&mut next);
            last
        };
        let stream_metadata_changes = {
            use schema::stream_metadata_changes::dsl::*;
            let mut last = stream_metadata_changes
                .left_join(schema::games::table)
                .filter(streamer_id.eq(id).and(time.lt(&from)))
                .order(time.desc())
                .limit(1)
                .load::<(StreamMetadataChange, Option<Game>)>(dbconn)?;
            let mut metadatas = stream_metadata_changes
                .left_join(schema::games::table)
                .filter(streamer_id.eq(id).and(time.ge(&from).and(time.lt(&to))))
                .order(time.asc())
                .load::<(StreamMetadataChange, Option<Game>)>(dbconn)?;
            let mut next = stream_metadata_changes
                .left_join(schema::games::table)
                .filter(streamer_id.eq(id).and(time.ge(&to)))
                .order(time.asc())
                .limit(1)
                .load::<(StreamMetadataChange, Option<Game>)>(dbconn)?;
            last.append(&mut metadatas);
            last.append(&mut next);
            last
        };
        let stream_changes = stream_changes.into_iter().map(|(time, viewer, chatter, follower, chatting_speed)| (time.timestamp(), viewer, chatter, follower, chatting_speed)).collect();
        let stream_metadata_changes = stream_metadata_changes.into_iter().map(|(metadata_change, game)| StreamMetadataChangeWithGame {
            language: metadata_change.language,
            title: metadata_change.title,
            started_at: metadata_change.started_at.timestamp(),
            time: metadata_change.time.timestamp(),
            game: game }).collect();
        Ok(Timeline{
            stream_changes, 
            stream_metadata_changes, })
    }
}

pub type TstzRange = (Bound<chrono::DateTime<chrono::Utc>>, Bound<chrono::DateTime<chrono::Utc>>);

#[derive(Serialize, Deserialize, Queryable, QueryableByName, Associations, Debug)]
#[table_name = "stream_ranges"]
pub struct StreamRange {
    pub range: TstzRange,
}

impl StreamRange {
    pub fn load(dbconn: &PgConnection, id: i64, from: chrono::DateTime<chrono::Utc>, to: chrono::DateTime<chrono::Utc>) -> Result<Vec<(i64, i64)>, error::Error> {
       let ranges = diesel::sql_query("SELECT range FROM stream_ranges WHERE streamer_id = $1 AND range && $2")
           .bind::<diesel::sql_types::Int8, _>(id)
           .bind::<diesel::sql_types::Tstzrange, _>((Bound::Included(from), Bound::Excluded(to)))
           .load(dbconn)?;
       Ok(ranges.into_iter().map(|s: StreamRange| {
           let left = match s.range.0 {
               Bound::Included(t) | Bound::Excluded(t) => t.timestamp(),
               _ => -1,
           };
           let right = match s.range.1 {
               Bound::Included(t) | Bound::Excluded(t) => t.timestamp(),
               _ => -1,
           };
           (left, right)
       }).collect())
        /*use schema::stream_ranges::dsl::*;
        Ok(stream_ranges
            .filter(streamer_id.eq(id).and(range.overlaps_with(&(from, to))))
            .order(range.asc())
            .load::<StreamRange>(dbconn)?)*/
    }
}
