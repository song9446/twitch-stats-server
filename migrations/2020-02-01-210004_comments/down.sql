-- This file should undo anything in `up.sql`
DROP TRIGGER computed_score_trg ON comments;
DROP FUNCTION computed_score_function;
DROP INDEX comments_idx;
DROP INDEX comments_ip_hash_idx;
DROP TABLE comments;
