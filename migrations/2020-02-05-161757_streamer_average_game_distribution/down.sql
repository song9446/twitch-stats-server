-- This file should undo anything in `up.sql`
DROP TRIGGER streamer_game_trg ON streamers_average_game_distribution;
DROP FUNCTION streamer_game_info_update;

ALTER TABLE streamers DROP primary_game_id;
ALTER TABLE streamers DROP secondary_game_id;
ALTER TABLE streamers DROP ternary_game_id;
ALTER TABLE streamers DROP general_games_player_score;

DROP INDEX streamers_average_game_distribution_streamer_id_idx;
DROP INDEX streamers_average_game_distribution_streamer_id_hours_idx; 
DROP TABLE streamers_average_game_distribution; 

