const { pool } = require("../db/pool");

async function getMemberPointsSummary(discordUserId) {
  const totalResult = await pool.query(
    `
      SELECT COALESCE(SUM(points_awarded), 0) AS total_points
      FROM point_entries
      WHERE discord_user_id = $1
        AND is_voided = FALSE
    `,
    [discordUserId]
  );

  const entriesResult = await pool.query(
    `
      SELECT
        activity_label,
        calculation_type,
        hours,
        quantity,
        points_awarded,
        note,
        created_at
      FROM point_entries
      WHERE discord_user_id = $1
        AND is_voided = FALSE
      ORDER BY created_at DESC
      LIMIT 20
    `,
    [discordUserId]
  );

  return {
    totalPoints: Number(totalResult.rows[0]?.total_points || 0),
    entries: entriesResult.rows.map((row) => ({
      activityLabel: row.activity_label,
      calculationType: row.calculation_type,
      hours: row.hours,
      quantity: row.quantity,
      pointsAwarded: Number(row.points_awarded),
      note: row.note,
      createdAt: row.created_at,
    })),
  };
}

module.exports = {
  getMemberPointsSummary,
};
