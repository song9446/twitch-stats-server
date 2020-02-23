-- Your SQL goes here
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  streamer_id BIGINT NOT NULL REFERENCES streamers (id),
  fingerprint_hash BYTEA NOT NULL,
  nickname TEXT NOT NULL,
  password BYTEA NOT NULL,
  contents TEXT NOT NULL,
  upvote INTEGER NOT NULL DEFAULT 0,
  downvote INTEGER NOT NULL DEFAULT 0,
  parent_id INTEGER NOT NULL DEFAULT currval('comments_id_seq') REFERENCES comments (id),
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  score FLOAT NOT NULL DEFAULT 0,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX comments_idx ON comments(streamer_id, parent_id DESC, id ASC);
-- CREATE INDEX comments_parent_id_idx ON comments(streamer_id, parent_id DESC);
CREATE INDEX comments_ip_hash_idx ON comments(fingerprint_hash, id DESC);

CREATE OR REPLACE FUNCTION computed_score_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $BODY$
DECLARE
  n FLOAT := (NEW.upvote + NEW.downvote);
  p FLOAT := NEW.upvote / n;
  z FLOAT := 1.281551565545;
  l FLOAT := p + 1/(2*n)*z*z;
  r FLOAT := z*SQRT(p*(1-p)/n + z*z/(4*n*n));
  under FLOAT := 1+1/n*z*z;
BEGIN
  NEW.score = (l - r) / under;
  RETURN NEW;
END
$BODY$;

CREATE TRIGGER computed_score_trg
BEFORE UPDATE of upvote, downvote
ON comments
FOR EACH ROW
  EXECUTE PROCEDURE computed_score_function();
