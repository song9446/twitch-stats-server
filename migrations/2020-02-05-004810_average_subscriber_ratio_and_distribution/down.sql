-- This file should undo anything in `up.sql`
ALTER TABLE streamers DROP COLUMN average_subscriber_ratio;
DROP INDEX streamers_average_subscriber_distribution_streamer_id_idx;
DROP TABLE streamers_average_subscriber_distribution;
