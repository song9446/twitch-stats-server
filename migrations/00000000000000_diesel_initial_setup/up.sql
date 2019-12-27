CREATE TABLE streamers (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    login TEXT NOT NULL,
    profile_image_url TEXT,
    offline_image_url TEXT,
    broadcaster_type TEXT,
    description TEXT,
    type TEXT,
    is_streaming BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE games (
    id BIGINT PRIMARY KEY,
    name TEXT,
    box_art_url TEXT
);
CREATE TABLE streams (
    id BIGINT PRIMARY KEY,
    streamer_id BIGINT REFERENCES streamers (id),
    started_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE stream_changes (
    stream_id BIGINT REFERENCES streams (id),
    viewer_count INTEGER,
    chatter_count INTEGER,
    game_id BIGINT REFERENCES games (id),
    language CHAR(2),
    title TEXT,
    time TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (stream_id, time)
);
CREATE TABLE chatter_migrations (
    before BIGINT NOT NULL REFERENCES streamers (id),
    after BIGINT NOT NULL REFERENCES streamers (id),
    count INTEGER NOT NULL DEFAULT 0,
    time TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (before, after, time)
);
CREATE TABLE streamer_similarities (
    subject BIGINT NOT NULL REFERENCES streamers (id),
    object BIGINT NOT NULL REFERENCES streamers (id),
    ratio FLOAT NOT NULL DEFAULT 0,
    PRIMARY KEY (subject, object)
);
CREATE TABLE streamer_tsne_pos (
    streamer_id BIGINT NOT NULL REFERENCES streamers (id),
    x INT NOT NULL DEFAULT 0,
    y INT NOT NULL DEFAULT 0,
    PRIMARY KEY (x, y)
);
