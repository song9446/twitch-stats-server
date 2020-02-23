-- Your SQL goes here
CREATE TABLE streamer_recent_chatting_keywords (
    streamer_id BIGINT NOT NULL REFERENCES streamers (id),
    keyword TEXT NOT NULL,
    fraction FLOAT NOT NULL DEFAULT 0,
    PRIMARY KEY (streamer_id, keyword)
);
CREATE INDEX streamer_recent_chatting_keywords_streamer_id_idx ON streamer_recent_chatting_keywords(streamer_id);
