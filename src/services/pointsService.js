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
    throw new Error("Activitate invalida.");
  }

  if (activity.type === "fixed" || activity.type === "fixed_with_required_note") {
    return {
      pointsAwarded: activity.points,
      hours: null,
      quantity: null,
      activityLabelSnapshot: activity.label,
    };
  }

  if (activity.type === "donation_family") {
    const donationOption = getDonationOption(activityKey, optionKey);

    if (!donationOption) {
      throw new Error("Obiectul donat este invalid.");
    }

    if (donationOption.mode === "fixed") {
      return {
        pointsAwarded: donationOption.points,
        hours: null,
        quantity: null,
        activityLabelSnapshot: `${activity.label} - ${donationOption.label}`,
      };
    }

    const quantity = Number(rawValue);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Cantitatea trebuie sa fie un numar intreg mai mare ca 0.");
    }

    if (quantity % donationOption.unitSize !== 0) {
      throw new Error(
        `Cantitatea pentru ${donationOption.label} trebuie sa fie multiplu de ${donationOption.unitSize}.`
      );
    }

    return {
      pointsAwarded:
        (quantity / donationOption.unitSize) * donationOption.pointsPerUnit,
      hours: null,
      quantity,
      activityLabelSnapshot: `${activity.label} - ${donationOption.label}`,
    };
  }

  if (activity.type === "hourly") {
    const hours = Number(rawValue);

    if (!Number.isInteger(hours) || hours <= 0) {
      throw new Error("Orele trebuie sa fie un numar intreg mai mare ca 0.");
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
      throw new Error("Tipul livrarii este invalid.");
    }

    const quantity = Number(rawValue);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Cantitatea trebuie sa fie un numar intreg mai mare ca 0.");
    }

    if (quantity % deliveryOption.unitSize !== 0) {
      throw new Error(
        `Cantitatea pentru ${deliveryOption.label} trebuie sa fie multiplu de ${deliveryOption.unitSize}.`
      );
    }

    return {
      pointsAwarded:
        (quantity / deliveryOption.unitSize) * deliveryOption.pointsPerUnit,
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
    throw new Error("Activitatea selectata nu exista.");
  }

  if (activity.type === "fixed_with_required_note") {
    const cleanNote = String(note || "").trim();

    if (!cleanNote) {
      throw new Error("Descrierea este obligatorie pentru aceasta activitate.");
    }
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
    throw new Error(
      "Numarul de puncte de scazut trebuie sa fie un numar intreg mai mare ca 0."
    );
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
      "Corectie puncte",
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
