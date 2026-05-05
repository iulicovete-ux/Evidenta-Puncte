const { pool } = require("../db/pool");

async function getSnapshotBatches(guildId, limit = 25) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 25;

  const result = await pool.query(
    `
      SELECT
        sb.id,
        sb.label,
        sb.created_at,
        COUNT(ws.id) AS members_count
      FROM snapshot_batches sb
      LEFT JOIN weekly_snapshots ws
        ON ws.batch_id = sb.id
      WHERE sb.guild_id = $1
      GROUP BY sb.id, sb.label, sb.created_at
      ORDER BY sb.created_at DESC
      LIMIT $2
    `,
    [guildId, safeLimit]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    label: row.label,
    createdAt: row.created_at,
    membersCount: Number(row.members_count || 0),
  }));
}

async function getSnapshotBatchById(batchId) {
  const result = await pool.query(
    `
      SELECT
        id,
        guild_id,
        label,
        created_at
      FROM snapshot_batches
      WHERE id = $1
      LIMIT 1
    `,
    [batchId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: Number(row.id),
    guildId: row.guild_id,
    label: row.label,
    createdAt: row.created_at,
  };
}

async function getSnapshotEntries(batchId, page = 1, pageSize = 10) {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10;
  const offset = (safePage - 1) * safePageSize;

  const countResult = await pool.query(
    `
      SELECT COUNT(*) AS total_count
      FROM weekly_snapshots
      WHERE batch_id = $1
    `,
    [batchId]
  );

  const totalCount = Number(countResult.rows[0]?.total_count || 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));

  const result = await pool.query(
    `
      SELECT
        display_name,
        discord_user_id,
        total_points,
        entries_count
      FROM weekly_snapshots
      WHERE batch_id = $1
      ORDER BY total_points DESC, display_name ASC
      LIMIT $2 OFFSET $3
    `,
    [batchId, safePageSize, offset]
  );

  return {
    totalCount,
    totalPages,
    currentPage: safePage,
    pageSize: safePageSize,
    entries: result.rows.map((row, index) => ({
      rank: offset + index + 1,
      displayName: row.display_name || row.discord_user_id,
      discordUserId: row.discord_user_id,
      totalPoints: Number(row.total_points),
      entriesCount: Number(row.entries_count),
    })),
  };
}

module.exports = {
  getSnapshotBatches,
  getSnapshotBatchById,
  getSnapshotEntries,
};
