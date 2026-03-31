const { pool } = require("../db/pool");
const {
  getActivity,
  getDonationOption,
  getDeliveryOption,
} = require("../config/activities");

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

function calculatePoints(activityKey, rawValue = null, optionKey = null) {
  const activity = getActivity(activityKey);

  if (!activity) {
    throw new Error("Activitate invalidă.");
  }

  if (activity.type === "fixed") {
    return {
      pointsAwarded: activity.points,
      hours: null,
      quantity: null,
      activityLabelSnapshot: activity.label,
    };
  }

  if (activity.type === "donation_family") {
    const donationOption = getDonationOption(activityKey, rawValue);

    if (!donationOption) {
      throw new Error("Obiectul donat este invalid.");
    }

    return {
      pointsAwarded: donationOption.points,
      hours: null,
      quantity: null,
      activityLabelSnapshot: `${activity.label} - ${donationOption.label}`,
    };
  }

  if (activity.type === "hourly") {
    const hours = Number(rawValue);

    if (!Number.isInteger(hours) || hours <= 0) {
      throw new Error("Orele trebuie să fie un număr întreg mai mare ca 0.");
    }

    return {
      pointsAwarded: hours * activity.pointsPerUnit,
      hours,
      quantity: null,
      activityLabelSnapshot: activity.label,
    };
  }

  if (activity.type === "delivery_quantity") {
    const deliveryOption = getDeliveryOption(activityKey, optionKey);

    if (!deliveryOption) {
      throw new Error("Tipul livrării este invalid.");
    }

    const quantity = Number(rawValue);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Cantitatea trebuie să fie un număr întreg mai mare ca 0.");
    }

    if (quantity % deliveryOption.unitSize !== 0) {
      throw new Error(
        `Cantitatea pentru ${deliveryOption.label} trebuie să fie multiplu de ${deliveryOption.unitSize}.`
      );
    }

    return {
      pointsAwarded: (quantity / deliveryOption.unitSize) * deliveryOption.pointsPerUnit,
      hours: null,
      quantity,
      activityLabelSnapshot: `${activity.label} - ${deliveryOption.label}`,
    };
  }

  throw new Error("Tip de activitate necunoscut.");
}

async function addPointsEntry({
  guildId,
  targetMember,
  activityKey,
  addedByDiscordUserId,
  rawValue = null,
  optionKey = null,
  note = null,
}) {
  const activity = getActivity(activityKey);

  if (!activity) {
    throw new Error("Activitatea selectată nu există.");
  }

  await upsertTrackedUser(targetMember);

  const calculation = calculatePoints(activityKey, rawValue, optionKey);

  await pool.query(
    `
      INSERT INTO point_entries (
        guild_id,
        discord_user_id,
        activity_key,
        activity_label,
        calculation_type,
        hours,
        quantity,
        points_awarded,
        added_by_discord_user_id,
        note
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
    [
      guildId,
      targetMember.id,
      activityKey,
      calculation.activityLabelSnapshot,
      activity.type,
      calculation.hours,
      calculation.quantity,
      calculation.pointsAwarded,
      addedByDiscordUserId,
      note,
    ]
  );

  return {
    activity,
    ...calculation,
  };
}

async function addNegativeAdjustmentEntry({
  guildId,
  targetMember,
  removedByDiscordUserId,
  pointsToRemove,
  reason,
}) {
  await upsertTrackedUser(targetMember);

  const parsedPoints = Number(pointsToRemove);

  if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
    throw new Error("Numărul de puncte de scăzut trebuie să fie un număr întreg mai mare ca 0.");
  }

  const cleanReason = String(reason || "").trim();

  if (!cleanReason) {
    throw new Error("Motivul este obligatoriu.");
  }

  const negativePoints = -parsedPoints;

  await pool.query(
    `
      INSERT INTO point_entries (
        guild_id,
        discord_user_id,
        activity_key,
        activity_label,
        calculation_type,
        hours,
        quantity,
        points_awarded,
        added_by_discord_user_id,
        note
      )
      VALUES ($1, $2, $3, $4, $5, NULL, NULL, $6, $7, $8)
    `,
    [
      guildId,
      targetMember.id,
      "manual_adjustment_negative",
      "Corecție puncte",
      "adjustment",
      negativePoints,
      removedByDiscordUserId,
      cleanReason,
    ]
  );

  return {
    pointsRemoved: parsedPoints,
    pointsAwarded: negativePoints,
    reason: cleanReason,
  };
}

module.exports = {
  addPointsEntry,
  addNegativeAdjustmentEntry,
  calculatePoints,
};
