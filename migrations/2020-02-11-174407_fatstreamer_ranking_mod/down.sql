-- This file should undo anything in `up.sql`
DROP VIEW fat_streamers;
ALTER TABLE streamers RENAME COLUMN average_subscriber_chat_ratio TO average_subscriber_ratio; 
CREATE VIEW fat_streamers AS
  SELECT s.id, s.login, s.name, profile_image_url, offline_image_url, broadcaster_type, description, is_streaming, average_viewer_count, follower_count,
    1 - sasd.ratio AS average_subscriber_ratio, 
    CASE WHEN s.is_streaming = TRUE THEN chatting_speed
         ELSE NULL 
    END AS chatting_speed, 
    general_game_player_score, primary_game_id, secondary_game_id, ternary_game_id, g1.name as primary_game_name, g2.name as secondary_game_name, g3.name as ternary_game_name,
    streaming_hours_per_week,
    last_streaming_time
    FROM streamers s 
    LEFT JOIN LATERAL (SELECT time as last_streaming_time, chatting_speed, follower_count FROM stream_changes sc2 WHERE s.id = sc2.streamer_id ORDER BY sc2.time DESC LIMIT 1) cs ON TRUE
    LEFT JOIN games g1 ON g1.id = primary_game_id
    LEFT JOIN games g2 ON g2.id = secondary_game_id
    LEFT JOIN games g3 ON g3.id = ternary_game_id
    LEFT JOIN LATERAL (SELECT 24*7*EXTRACT(EPOCH FROM sum(streaming_time))/EXTRACT(EPOCH FROM greatest(now() - min(lower_range), interval '7 days')) as streaming_hours_per_week 
        FROM (SELECT (upper(range)-lower(range)) AS streaming_time, lower(range) as lower_range 
                FROM stream_ranges sr
                WHERE sr.streamer_id = s.id AND range && tstzrange((now() - interval '60 day'), now())) t) pp ON TRUE
    LEFT JOIN streamers_average_subscriber_distribution sasd ON sasd.streamer_id = s.id and sasd.month = -1;
  
DROP INDEX streamers_name_trgm_idx; 

DROP EXTENSION pg_trgm;

DROP TRIGGER comment_votes_trg on comment_votes;
DROP FUNCTION comment_vote_num_update;

DROP TABLE comment_votes;
