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
CREATE TABLE streamer_clusters (
    streamer_id BIGINT NOT NULL REFERENCES streamers (id),
    cluster INT NOT NULL DEFAULT -1,
    probability FLOAT NOT NULL DEFAULT 0,
    PRIMARY KEY (streamer_id)
);
CREATE TABLE stream_metadata_changes (
  streamer_id BIGINT NOT NULL REFERENCES streamers (id),
  game_id BIGINT REFERENCES games (id),
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (streamer_id, time)
);
CREATE TABLE stream_changes (
  streamer_id BIGINT NOT NULL REFERENCES streamers (id),
  viewer_count INT NOT NULL DEFAULT 0,
  chatter_count INT NOT NULL DEFAULT 0,
  follower_count INT NOT NULL DEFAULT 0,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (streamer_id, time)
);
/*
CREATE TABLE streamer_chatter_count_changes (
  streamer_id BIGINT NOT NULL REFERENCES streamers (id),
  chatter_count INT NOT NULL DEFAULT 0,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (streamer_id, time)
);
CREATE TABLE streamer_follower_count_changes (
  streamer_id BIGINT NOT NULL REFERENCES streamers (id),
  follower_count INT NOT NULL DEFAULT 0,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (streamer_id, time)
);
CREATE TABLE chatter_migrations (
    before BIGINT NOT NULL REFERENCES streamers (id),
    after BIGINT NOT NULL REFERENCES streamers (id),
    count FLOAT NOT NULL DEFAULT 0,
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (before, after, time)
);*/
