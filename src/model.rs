use diesel::prelude::*;
use diesel::RunQueryDsl;
use diesel::QueryDsl;
<<<<<<< HEAD
use diesel::pg::expression::dsl::any;
use diesel::sql_types::*;
use diesel::{r2d2::ConnectionManager, PgConnection};
use std::collections::Bound;
use super::schema_manual::*;
use super::schema;
use super::schema::{stream_ranges, comments, streamers};
=======
use diesel::sql_types::*;
use diesel::{r2d2::ConnectionManager, PgConnection};
use std::collections::Bound;
use super::schema;
use super::schema::stream_ranges;
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
<<<<<<< HEAD

=======
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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

<<<<<<< HEAD
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct Game {
    pub id: i64,
    pub name: Option<String>,
    pub box_art_url: Option<String>,
}

#[derive(Serialize, Deserialize, Queryable, Associations)]
pub struct FatStreamer {
    pub id: i64,
    pub login: String,
    pub name: String,
    pub profile_image_url: Option<String>,
    pub offline_image_url: Option<String>,
    pub broadcaster_type: Option<String>,
    pub description: Option<String>,
    pub is_streaming: bool, 
    pub average_viewer_count: i32, 
    pub follower_count: i32, 
    pub viewer_count: Option<i32>, 
    pub viewer_chatter_ratio: Option<f64>, 
    pub average_subscriber_ratio: Option<f64>,
    pub average_subscriber_chat_ratio: f64,
    pub chatting_speed: Option<f64>,
    pub general_game_player_score: f64,
    pub primary_game_id: Option<i64>,
    pub secondary_game_id: Option<i64>, 
    pub ternary_game_id: Option<i64>, 
    pub primary_game_name: Option<String>, 
    pub secondary_game_name: Option<String>, 
    pub ternary_game_name: Option<String>,
    pub streaming_hours_per_week: Option<f64>,
    pub last_streaming_time: Option<chrono::DateTime<chrono::Utc>>,
}
impl FatStreamer {
    pub fn load(dbconn: &PgConnection, id: i64) -> Result<FatStreamer, error::Error> {
        Ok(fat_streamers::table
            .filter(fat_streamers::id.eq(id))
            .first::<FatStreamer>(dbconn)?)
    }
}
=======
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643

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
<<<<<<< HEAD
    pub average_subscriber_chat_ratio: f64,
    pub primary_game_id: Option<i64>,
    pub secondary_game_id: Option<i64>,
    pub ternary_game_id: Option<i64>,
    pub general_game_player_score: f64,
=======
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
<<<<<<< HEAD
    pub fn load(dbconn: &PgConnection, subject_id: i64, num: i64, offset: i64) -> Result<Vec<SimilarStreamer>, error::Error> {
=======
    pub fn load(dbconn: &PgConnection, subject_id: i64) -> Result<Vec<SimilarStreamer>, error::Error> {
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
        use schema::streamer_similarities::dsl::*;
        use schema::streamers::dsl::*;
        Ok(streamer_similarities
                .inner_join(streamers.on(id.eq(object)))
                .select((id, name, profile_image_url, is_streaming, ratio))
                .filter(subject.eq(subject_id).and(subject.ne(object)))
                .order(ratio.desc())
<<<<<<< HEAD
                .limit(num)
                .offset(offset)
=======
                .limit(10)
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
                .load::<SimilarStreamer>(dbconn)?)
    }
}

<<<<<<< HEAD

=======
#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct Game {
    pub id: i64,
    pub name: Option<String>,
    pub box_art_url: Option<String>,
}
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
<<<<<<< HEAD

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
#[table_name = "comments"]
pub struct _Comment {
    pub id: i32,
    pub streamer_id: i64,
    pub fingerprint_hash: Vec<u8>,
    pub nickname: String,
    pub password: Vec<u8>,
    pub contents: String,
    pub upvote: i32,
    pub downvote: i32,
    pub parent_id: i32,
    pub deleted: bool,
    pub score: f64,
    pub time: chrono::DateTime<chrono::Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Comment {
    pub id: i32,
    pub streamer_id: i64,
    pub fingerprint_hash: Vec<u8>,
    pub nickname: String,
    pub contents: Option<String>,
    pub upvote: i32,
    pub downvote: i32,
    pub parent_id: i32,
    pub deleted: bool,
    pub score: f64,
    pub time: chrono::DateTime<chrono::Utc>,
}
impl Comment {
    pub fn load_by_streamer_id(dbconn: &PgConnection, _streamer_id: i64, count: i64, offset: i64) -> Result<Vec<Comment>, error::Error> {
        use schema::comments::dsl::*;
        Ok(comments
            .filter(streamer_id.eq(_streamer_id))
            .order((score.desc(), parent_id.desc(), id.asc()))
            .limit(count)
            .offset(offset)
            .load::<_Comment>(dbconn)?
            .into_iter()
            .map(|c| Comment { 
                id: c.id,
                streamer_id: c.streamer_id,
                fingerprint_hash: c.fingerprint_hash,
                nickname: c.nickname,
                contents: if c.deleted { None } else { Some(c.contents) },
                upvote: c.upvote,
                downvote: c.downvote,
                parent_id: c.parent_id,
                deleted: c.deleted,
                score: c.score,
                time: c.time,
            }).collect())
    }
    pub fn vote(dbconn: &PgConnection, _id: i32, _fingerprint_hash: Vec<u8>, _upvote: bool) -> Result<(), error::Error> {
        use schema::comment_votes::dsl::*;
        diesel::insert_into(comment_votes)
            .values((comment_id.eq(_id), fingerprint_hash.eq(_fingerprint_hash), upvote.eq(_upvote)))
            .execute(dbconn)?;
        Ok(())
            
    }
}

#[derive(Insertable, Serialize, Deserialize)]
#[table_name = "comments"]
pub struct NewComment {
    pub streamer_id: i64,
    pub nickname: String,
    pub password: Vec<u8>,
    pub contents: String,
    pub fingerprint_hash: Vec<u8>,
    pub parent_id: Option<i32>,
}
impl NewComment {
    pub fn write(self, dbconn: &PgConnection) -> Result<(), error::Error> {
        use schema::comments::dsl::*;
        diesel::insert_into(comments)
            .values(&self)
            .execute(dbconn)?;
        Ok(())
    }
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamerRecentChattingKeyword {
    pub keyword: String,
    pub fraction: f64,
}
impl StreamerRecentChattingKeyword {
    pub fn load(dbconn: &PgConnection, id: i64) -> Result<Vec<(String, f64)>, error::Error> {
        use schema::streamer_recent_chatting_keywords::dsl::*;
        Ok(streamer_recent_chatting_keywords
            .select((keyword, fraction))
            .filter(streamer_id.eq(id))
            .load(dbconn)?)
    }
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct StreamersAverageSubscriberDistribution {
    pub streamer_id: i64,
    pub month: i32,
    pub ratio: f64,
}
impl StreamersAverageSubscriberDistribution {
    pub fn load(dbconn: &PgConnection, id: i64) -> Result<Vec<(i32, f64)>, error::Error> {
        use schema::streamers_average_subscriber_distribution::dsl::*;
        Ok(streamers_average_subscriber_distribution
            .select((month, ratio))
            .filter(streamer_id.eq(id))
            .order(month)
            .load(dbconn)?)
    }
}



pub struct FatStreamerRanking;
impl FatStreamerRanking {
    pub fn load(dbconn: &PgConnection, num: i64, offset: i64, order_by: String, desc: bool) -> Result<Vec<FatStreamer>, error::Error> {
        match (order_by.as_str(), desc) {
            ("chatting_speed", true) => {
                Ok(fat_streamers::table.order_by(fat_streamers::chatting_speed.desc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("chatting_speed", false) => {
                Ok(fat_streamers::table.order_by(fat_streamers::chatting_speed.asc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("average_viewer_count", true) => {
                Ok(fat_streamers::table.order_by(fat_streamers::average_viewer_count.desc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("average_viewer_count", false) => {
                Ok(fat_streamers::table.order_by(fat_streamers::average_viewer_count.asc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("average_subscriber_ratio", true) => {
                Ok(fat_streamers::table.order_by(fat_streamers::average_subscriber_ratio.desc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("average_subscriber_ratio", false) => {
                Ok(fat_streamers::table.order_by(fat_streamers::average_subscriber_ratio.asc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("streaming_hours_per_week", true) => {
                Ok(fat_streamers::table.order_by(fat_streamers::streaming_hours_per_week.desc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("streaming_hours_per_week", false) => {
                Ok(fat_streamers::table.order_by(fat_streamers::streaming_hours_per_week.asc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("follower_count", true) => {
                Ok(fat_streamers::table.order_by(fat_streamers::follower_count.desc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("follower_count", false) => {
                Ok(fat_streamers::table.order_by(fat_streamers::follower_count.asc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("viewer_count", true) => {
                Ok(fat_streamers::table.order_by(fat_streamers::viewer_count.desc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("viewer_count", false) => {
                Ok(fat_streamers::table.order_by(fat_streamers::viewer_count.asc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("viewer_chatter_ratio", true) => {
                Ok(fat_streamers::table.order_by(fat_streamers::viewer_chatter_ratio.desc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            ("viewer_chatter_ratio", false) => {
                Ok(fat_streamers::table.order_by(fat_streamers::viewer_chatter_ratio.asc().nulls_last())
                    .limit(num)
                    .offset(offset)
                    .load::<FatStreamer>(dbconn)?)
            },
            _ => Err(error::Error::BadRequest),
        }
    }
}

#[derive(Serialize, Deserialize, Queryable, Associations, Debug)]
pub struct ViewerMigrationCount {
    pub source: i64,
    pub destination: i64,
    pub migration_count: i32,
    pub time: chrono::DateTime<chrono::Utc>,
}
impl ViewerMigrationCount {
    pub fn load(dbconn: &PgConnection, id1: i64, id2: i64, from: chrono::DateTime<chrono::Utc>, to: chrono::DateTime<chrono::Utc>) -> Result<Vec<ViewerMigrationCount>, error::Error> {
        use schema::viewer_migration_counts::dsl::*;
        let ids = vec![id1, id2];
        Ok(viewer_migration_counts
            .filter(source.eq(any(&ids))
                    .and(destination.eq(any(&ids)))
                    .and(time.ge(&from))
                    .and(time.lt(&to)))
            .order(time.asc())
            .load::<ViewerMigrationCount>(dbconn)?)
    }
}

#[derive(Serialize, Deserialize, Queryable, QueryableByName, Associations, Debug)]
pub struct ViewerMigrationCountRanking {
    #[sql_type = "Int8"]
    pub source_id: i64,
    #[sql_type = "Text"]
    pub source_name: String,
    #[sql_type = "Nullable<Text>"]
    pub source_profile_image_url: Option<String>,
    #[sql_type = "Bool"]
    pub source_is_streaming: bool,
    #[sql_type = "Int8"]
    pub destination_id: i64,
    #[sql_type = "Text"]
    pub destination_name: String,
    #[sql_type = "Nullable<Text>"]
    pub destination_profile_image_url: Option<String>,
    #[sql_type = "Bool"]
    pub destination_is_streaming: bool,
    #[sql_type = "Int4"]
    pub migration_count: i32,
    #[sql_type = "Timestamptz"]
    pub time: chrono::DateTime<chrono::Utc>,
}

impl ViewerMigrationCountRanking {
    pub fn load(dbconn: &PgConnection, num: i64, offset: i64) -> Result<Vec<ViewerMigrationCountRanking>, error::Error> {
       Ok(diesel::sql_query(r#"
        SELECT s1.id as source_id, s1.name as source_name, s1.profile_image_url as source_profile_image_url, s1.is_streaming as source_is_streaming, 
               s2.id as destination_id, s2.name as destination_name, s2.profile_image_url as destination_profile_image_url, s2.is_streaming as destination_is_streaming, 
               migration_count, time
                FROM viewer_migration_counts vmc 
                INNER JOIN streamers s1 ON s1.id = vmc.source
                INNER JOIN streamers s2 ON s2.id = vmc.destination
                WHERE time = (SELECT time FROM viewer_migration_counts ORDER BY time DESC LIMIT 1)
                ORDER BY vmc.migration_count DESC
                LIMIT $1 OFFSET $2
        ;"#)
           .bind::<diesel::sql_types::Int8, _>(num)
           .bind::<diesel::sql_types::Int8, _>(offset)
           .load(dbconn)?)
    }
}
=======
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
