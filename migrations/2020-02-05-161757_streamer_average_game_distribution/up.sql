-- Your SQL goes here
CREATE TABLE streamers_average_game_distribution (
  streamer_id BIGINT NOT NULL REFERENCES streamers (id),
  game_id BIGINT NOT NULL REFERENCES games (id), 
  hours FLOAT NOT NULL DEFAULT 0,
  PRIMARY KEY (streamer_id, game_id)
);
CREATE INDEX streamers_average_game_distribution_streamer_id_idx ON streamers_average_game_distribution (streamer_id);
CREATE INDEX streamers_average_game_distribution_streamer_id_hours_idx ON streamers_average_game_distribution (streamer_id, hours DESC);

ALTER TABLE streamers ADD primary_game_id BIGINT REFERENCES games (id);
ALTER TABLE streamers ADD secondary_game_id BIGINT REFERENCES games (id);
ALTER TABLE streamers ADD ternary_game_id BIGINT REFERENCES games (id);
ALTER TABLE streamers ADD general_game_player_score FLOAT NOT NULL DEFAULT 0.0;


CREATE OR REPLACE FUNCTION streamer_game_info_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $BODY$
DECLARE
BEGIN
  WITH sq AS (
    SELECT sagd.game_id FROM streamers_average_game_distribution sagd WHERE sagd.streamer_id = NEW.streamer_id AND sagd.hours > 1.0 ORDER BY sagd.hours DESC LIMIT 3
  )
  UPDATE streamers SET (primary_game_id, secondary_game_id, ternary_game_id, general_game_player_score) = 
    (SELECT 
      (SELECT * FROM sq OFFSET 0 LIMIT 1),
      (SELECT * FROM sq OFFSET 1 LIMIT 1),
      (SELECT * FROM sq OFFSET 2 LIMIT 1),
      (SELECT COUNT(*) FROM streamers_average_game_distribution sagd WHERE sagd.streamer_id = NEW.streamer_id AND sagd.hours > 1.0)
    )
    WHERE id = NEW.streamer_id;
  RETURN NEW;
END
$BODY$;

CREATE TRIGGER streamer_game_trg
AFTER INSERT OR UPDATE
ON streamers_average_game_distribution
FOR EACH STATEMENT
  EXECUTE PROCEDURE streamer_game_info_update();
