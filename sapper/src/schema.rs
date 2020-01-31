table! {
    games (id) {
        id -> Int8,
        name -> Nullable<Text>,
        box_art_url -> Nullable<Text>,
    }
}

table! {
    stream_changes (streamer_id, time) {
        streamer_id -> Int8,
        viewer_count -> Int4,
        chatter_count -> Int4,
        follower_count -> Int4,
        time -> Timestamptz,
        chatting_speed -> Float8,
    }
}

table! {
    stream_metadata_changes (streamer_id, time) {
        streamer_id -> Int8,
        game_id -> Nullable<Int8>,
        language -> Text,
        title -> Text,
        started_at -> Timestamptz,
        time -> Timestamptz,
    }
}

table! {
    stream_ranges (streamer_id, range) {
        streamer_id -> Int8,
        range -> Tstzrange,
    }
}

table! {
    streamer_clusters (streamer_id) {
        streamer_id -> Int8,
        cluster -> Int4,
        probability -> Float8,
    }
}

table! {
    streamer_similarities (subject, object) {
        subject -> Int8,
        object -> Int8,
        ratio -> Float8,
    }
}

table! {
    streamer_tsne_pos (x, y) {
        streamer_id -> Int8,
        x -> Int4,
        y -> Int4,
    }
}

table! {
    streamers (id) {
        id -> Int8,
        name -> Text,
        login -> Text,
        profile_image_url -> Nullable<Text>,
        offline_image_url -> Nullable<Text>,
        broadcaster_type -> Nullable<Text>,
        description -> Nullable<Text>,
        #[sql_name = "type"]
        type_ -> Nullable<Text>,
        is_streaming -> Bool,
        average_viewer_count -> Int4,
    }
}

joinable!(stream_changes -> streamers (streamer_id));
joinable!(stream_metadata_changes -> games (game_id));
joinable!(stream_metadata_changes -> streamers (streamer_id));
joinable!(stream_ranges -> streamers (streamer_id));
joinable!(streamer_clusters -> streamers (streamer_id));
joinable!(streamer_tsne_pos -> streamers (streamer_id));

allow_tables_to_appear_in_same_query!(
    games,
    stream_changes,
    stream_metadata_changes,
    stream_ranges,
    streamer_clusters,
    streamer_similarities,
    streamer_tsne_pos,
    streamers,
);
