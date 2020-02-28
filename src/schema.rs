table! {
    comment_votes (fingerprint_hash, comment_id) {
        fingerprint_hash -> Bytea,
        comment_id -> Int4,
        upvote -> Bool,
    }
}

table! {
    comments (id) {
        id -> Int4,
        streamer_id -> Int8,
        fingerprint_hash -> Bytea,
        nickname -> Text,
        password -> Bytea,
        contents -> Text,
        upvote -> Int4,
        downvote -> Int4,
        parent_id -> Int4,
        deleted -> Bool,
        score -> Float8,
        time -> Timestamptz,
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
    streamer_recent_chatting_keywords (streamer_id, keyword) {
        streamer_id -> Int8,
        keyword -> Text,
        fraction -> Float8,
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
        average_subscriber_chat_ratio -> Float8,
        primary_game_id -> Nullable<Int8>,
        secondary_game_id -> Nullable<Int8>,
        ternary_game_id -> Nullable<Int8>,
        general_game_player_score -> Float8,
    }
}

table! {
    streamers_average_game_distribution (streamer_id, game_id) {
        streamer_id -> Int8,
        game_id -> Int8,
        hours -> Float8,
    }
}

table! {
    streamers_average_subscriber_distribution (streamer_id, month) {
        streamer_id -> Int8,
        month -> Int4,
        ratio -> Float8,
    }
}

table! {
    viewer_migration_counts (source, destination, time) {
        source -> Int8,
        destination -> Int8,
        migration_count -> Int4,
        time -> Timestamptz,
    }
}

joinable!(comments -> streamers (streamer_id));
joinable!(stream_changes -> streamers (streamer_id));
joinable!(stream_metadata_changes -> games (game_id));
joinable!(stream_metadata_changes -> streamers (streamer_id));
joinable!(stream_ranges -> streamers (streamer_id));
joinable!(streamer_clusters -> streamers (streamer_id));
joinable!(streamer_recent_chatting_keywords -> streamers (streamer_id));
joinable!(streamer_tsne_pos -> streamers (streamer_id));
joinable!(streamers_average_game_distribution -> games (game_id));
joinable!(streamers_average_game_distribution -> streamers (streamer_id));
joinable!(streamers_average_subscriber_distribution -> streamers (streamer_id));

allow_tables_to_appear_in_same_query!(
    comment_votes,
    comments,
    games,
    stream_changes,
    stream_metadata_changes,
    stream_ranges,
    streamer_clusters,
    streamer_recent_chatting_keywords,
    streamer_similarities,
    streamer_tsne_pos,
    streamers,
    streamers_average_game_distribution,
    streamers_average_subscriber_distribution,
    viewer_migration_counts,
);
