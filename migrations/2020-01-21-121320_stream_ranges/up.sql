-- Your SQL goes here
CREATE TABLE stream_ranges (
  streamer_id BIGINT NOT NULL REFERENCES streamers (id),
  range tstzrange NOT NULL,
  PRIMARY KEY (streamer_id, range)
);
