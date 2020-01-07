table! {
    games (id) {
        id -> Int8,
        name -> Nullable<Text>,
        box_art_url -> Nullable<Text>,
    }
}

table! {
    streamer_chatter_count_changes (streamer_id, time) {
        streamer_id -> Int8,
        chatter_count -> Int4,
        time -> Timestamptz,
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
    streamer_follower_count_changes (streamer_id, time) {
        streamer_id -> Int8,
        follower_count -> Int4,
        time -> Timestamptz,
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
    streamer_stream_metadata_changes (streamer_id, time) {
        streamer_id -> Int8,
        game_id -> Nullable<Int8>,
        language -> Nullable<Text>,
        title -> Nullable<Text>,
        started_at -> Nullable<Timestamptz>,
        time -> Timestamptz,
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
    streamer_viewer_count_changes (streamer_id, time) {
        streamer_id -> Int8,
        viewer_count -> Int4,
        time -> Timestamptz,
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
    }
}

joinable!(streamer_chatter_count_changes -> streamers (streamer_id));
joinable!(streamer_clusters -> streamers (streamer_id));
joinable!(streamer_follower_count_changes -> streamers (streamer_id));
joinable!(streamer_stream_metadata_changes -> games (game_id));
joinable!(streamer_stream_metadata_changes -> streamers (streamer_id));
joinable!(streamer_tsne_pos -> streamers (streamer_id));
joinable!(streamer_viewer_count_changes -> streamers (streamer_id));

allow_tables_to_appear_in_same_query!(
    games,
    streamer_chatter_count_changes,
    streamer_clusters,
    streamer_follower_count_changes,
    streamer_similarities,
    streamer_stream_metadata_changes,
    streamer_tsne_pos,
    streamer_viewer_count_changes,
    streamers,
);
