const { pool } = require("../db/pool");
const { getCreditActivity } = require("../config/creditActivities");

async function upsertTrackedUser(member) {
  const discordUserId = member.id;
  const username = member.user.username;
  const displayName = member.displayName;

  await pool.query(
    `
      INSERT INTO users (discord_user_id, username, display_name, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (discord_user_id)
      DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        updated_at = CURRENT_TIMESTAMP
    `,
    [discordUserId, username, displayName]
  );
}

async function addCreditEntry({
  guildId,
  targetMember,
  activityKey,
  addedByDiscordUserId,
  note = null,
}) {
  const activity = getCreditActivity(activityKey);

  if (!activity) {
    throw new Error("Activitatea de credit selectată nu există.");
  }

  await upsertTrackedUser(targetMember);

  await pool.query(
    `
      INSERT INTO credit_entries (
        guild_id,
        discord_user_id,
        activity_key,
        activity_label,
        credits_awarded,
        added_by_discord_user_id,
        note
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      guildId,
      targetMember.id,
      activityKey,
      activity.label,
      activity.credits,
      addedByDiscordUserId,
      note,
    ]
  );

  return {
    activityKey,
    activityLabel: activity.label,
    creditsAwarded: activity.credits,
    note,
  };
}

async function removeCreditEntry({
  guildId,
  targetMember,
  removedByDiscordUserId,
  creditsToRemove,
  reason,
}) {
  await upsertTrackedUser(targetMember);

  const parsedCredits = Number(creditsToRemove);

  if (!Number.isInteger(parsedCredits) || parsedCredits <= 0) {
    throw new Error(
      "Numărul de credite de scăzut trebuie să fie un număr întreg mai mare ca 0."
    );
  }

  const cleanReason = String(reason || "").trim();

  if (!cleanReason) {
    throw new Error("Motivul este obligatoriu.");
  }

  const negativeCredits = -parsedCredits;

  await pool.query(
    `
      INSERT INTO credit_entries (
        guild_id,
        discord_user_id,
        activity_key,
        activity_label,
        credits_awarded,
        added_by_discord_user_id,
        note
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      guildId,
      targetMember.id,
      "manual_adjustment_negative",
      "Corecție credite",
      negativeCredits,
      removedByDiscordUserId,
      cleanReason,
    ]
  );

  return {
    creditsRemoved: parsedCredits,
    creditsAwarded: negativeCredits,
    reason: cleanReason,
  };
}

async function getMemberCreditsSummary(discordUserId) {
  const totalResult = await pool.query(
    `
      SELECT COALESCE(SUM(credits_awarded), 0) AS total_credits
      FROM credit_entries
      WHERE discord_user_id = $1
    `,
    [discordUserId]
  );

  return {
    totalCredits: Number(totalResult.rows[0]?.total_credits || 0),
  };
}

async function getMemberCreditsPage(discordUserId, page = 1, pageSize = 10) {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize =
    Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10;
  const offset = (safePage - 1) * safePageSize;

  const totalCountResult = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM credit_entries
      WHERE discord_user_id = $1
    `,
    [discordUserId]
  );

  const total = Number(totalCountResult.rows[0]?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));

  const entriesResult = await pool.query(
    `
      SELECT
        activity_label,
        credits_awarded,
        note,
        created_at,
        added_by_discord_user_id
      FROM credit_entries
      WHERE discord_user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [discordUserId, safePageSize, offset]
  );

  return {
    entries: entriesResult.rows.map((row) => ({
      activityLabel: row.activity_label,
      creditsAwarded: Number(row.credits_awarded),
      note: row.note,
      createdAt: row.created_at,
      addedByDiscordUserId: row.added_by_discord_user_id,
    })),
    currentPage: safePage,
    totalPages,
  };
}

module.exports = {
  addCreditEntry,
  removeCreditEntry,
  getMemberCreditsSummary,
  getMemberCreditsPage,
};
