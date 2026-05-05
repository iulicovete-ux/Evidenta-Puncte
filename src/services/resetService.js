const { pool } = require("../db/pool");

async function resetWeeklyPoints({ guildId, resetByDiscordUserId, snapshotLabel }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const batchInsertResult = await client.query(
      `
        INSERT INTO snapshot_batches (
          guild_id,
          label,
          reset_by_discord_user_id
        )
        VALUES ($1, $2, $3)
        RETURNING id, label, created_at
      `,
      [guildId, snapshotLabel, resetByDiscordUserId]
    );

    const batch = batchInsertResult.rows[0];

    const snapshotResult = await client.query(
      `
        SELECT
          pe.discord_user_id,
          COALESCE(u.display_name, u.username, pe.discord_user_id) AS display_name,
          COALESCE(SUM(pe.points_awarded), 0) AS total_points,
          COUNT(*) AS entries_count
        FROM point_entries pe
        LEFT JOIN users u
          ON u.discord_user_id = pe.discord_user_id
        WHERE pe.guild_id = $1
          AND pe.is_voided = FALSE
        GROUP BY pe.discord_user_id, u.display_name, u.username
        HAVING COALESCE(SUM(pe.points_awarded), 0) > 0
      `,
      [guildId]
    );

    const snapshotRows = snapshotResult.rows;

    for (const row of snapshotRows) {
      await client.query(
        `
          INSERT INTO weekly_snapshots (
            batch_id,
            guild_id,
            discord_user_id,
            display_name,
            total_points,
            entries_count,
            reset_by_discord_user_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          batch.id,
          guildId,
          row.discord_user_id,
          row.display_name,
          Number(row.total_points),
          Number(row.entries_count),
          resetByDiscordUserId,
        ]
      );
    }

    const deleteResult = await client.query(
      `
        DELETE FROM point_entries
        WHERE guild_id = $1
      `,
      [guildId]
    );

    await client.query("COMMIT");

    return {
      batchId: batch.id,
      batchLabel: batch.label,
      snapshotCount: snapshotRows.length,
      deletedEntriesCount: deleteResult.rowCount || 0,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  resetWeeklyPoints,
};
