const { pool } = require("./pool");

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT UNIQUE NOT NULL,
        username TEXT,
        display_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS point_entries (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        discord_user_id TEXT NOT NULL,
        activity_key TEXT NOT NULL,
        activity_label TEXT NOT NULL,
        calculation_type TEXT NOT NULL,
        hours INTEGER,
        quantity INTEGER,
        points_awarded INTEGER NOT NULL,
        added_by_discord_user_id TEXT NOT NULL,
        note TEXT,
        is_voided BOOLEAN DEFAULT FALSE,
        void_reason TEXT,
        voided_by_discord_user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        voided_at TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS snapshot_batches (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        label TEXT NOT NULL,
        reset_by_discord_user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS weekly_snapshots (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        discord_user_id TEXT NOT NULL,
        display_name TEXT,
        total_points INTEGER NOT NULL,
        entries_count INTEGER NOT NULL DEFAULT 0,
        reset_by_discord_user_id TEXT NOT NULL,
        reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE weekly_snapshots
      ADD COLUMN IF NOT EXISTS batch_id INTEGER;
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'weekly_snapshots_batch_id_fkey'
        ) THEN
          ALTER TABLE weekly_snapshots
          ADD CONSTRAINT weekly_snapshots_batch_id_fkey
          FOREIGN KEY (batch_id)
          REFERENCES snapshot_batches(id)
          ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);

    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ Database init error:", err);
  }
}

module.exports = { initDatabase };
