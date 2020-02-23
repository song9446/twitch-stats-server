-- Your SQL goes here
CREATE INDEX viewer_migration_counts_time_count_idx ON viewer_migration_counts (time DESC, migration_count);
