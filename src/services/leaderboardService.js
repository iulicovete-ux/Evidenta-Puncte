const { pool } = require("../db/pool");

async function getLeaderboard(limit = 10) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;

  const result = await pool.query(
    `
      SELECT
        pe.discord_user_id,
        COALESCE(u.display_name, u.username, pe.discord_user_id) AS display_name,
        COALESCE(SUM(
          CASE
            WHEN pe.is_voided = FALSE THEN pe.points_awarded
            ELSE 0
          END
        ), 0) AS total_points
      FROM point_entries pe
      LEFT JOIN users u
        ON u.discord_user_id = pe.discord_user_id
      GROUP BY pe.discord_user_id, u.display_name, u.username
      ORDER BY total_points DESC, display_name ASC
      LIMIT $1
    `,
    [safeLimit]
  );

  return result.rows.map((row, index) => ({
    rank: index + 1,
    discordUserId: row.discord_user_id,
    displayName: row.display_name,
    totalPoints: Number(row.total_points),
  }));
}

module.exports = {
  getLeaderboard,
};
