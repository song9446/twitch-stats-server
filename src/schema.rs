table! {
    chatter_migrations (before, after, time) {
        before -> Int8,
        after -> Int8,
        count -> Int4,
        time -> Timestamp,
    }
}

table! {
    games (id) {
        id -> Int8,
        name -> Nullable<Text>,
        box_art_url -> Nullable<Text>,
    }
}

table! {
    stream_changes (stream_id, time) {
        stream_id -> Int8,
        viewer_count -> Nullable<Int4>,
        chatter_count -> Nullable<Int4>,
        game_id -> Nullable<Int8>,
        language -> Nullable<Bpchar>,
        title -> Nullable<Text>,
        time -> Timestamp,
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
    streams (id) {
        id -> Int8,
        streamer_id -> Nullable<Int8>,
        started_at -> Timestamp,
    }
}

joinable!(stream_changes -> games (game_id));
joinable!(stream_changes -> streams (stream_id));
joinable!(streamer_tsne_pos -> streamers (streamer_id));
joinable!(streams -> streamers (streamer_id));

allow_tables_to_appear_in_same_query!(
    chatter_migrations,
    games,
    stream_changes,
    streamers,
    streamer_similarities,
    streamer_tsne_pos,
    streams,
);
