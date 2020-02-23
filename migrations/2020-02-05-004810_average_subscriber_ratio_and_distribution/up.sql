-- Your SQL goes here
ALTER TABLE streamers ADD average_subscriber_ratio FLOAT NOT NULL DEFAULT 0;
CREATE TABLE streamers_average_subscriber_distribution (
    streamer_id BIGINT NOT NULL REFERENCES streamers (id),
    month INT NOT NULL, 
    ratio FLOAT NOT NULL DEFAULT 0,
    PRIMARY KEY (streamer_id, month)
  );
CREATE INDEX streamers_average_subscriber_distribution_streamer_id_idx ON streamers_average_subscriber_distribution(streamer_id);
