DROP TRIGGER streamer_game_trg ON streamers_average_game_distribution;
CREATE TRIGGER streamer_game_trg
AFTER INSERT OR UPDATE
ON streamers_average_game_distribution
FOR EACH ROW
  EXECUTE PROCEDURE streamer_game_info_update();
