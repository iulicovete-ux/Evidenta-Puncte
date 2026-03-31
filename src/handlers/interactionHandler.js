const { MessageFlags } = require("discord.js");
const { getActivity } = require("../config/activities");
const { canManagePoints, canResetPoints } = require("../config/permissions");
const { buildActivitiesInfoEmbed } = require("../ui/activitiesInfo");
const { buildLeaderboardEmbed } = require("../ui/leaderboard");
const {
  buildMemberPointsUserSelectRow,
  buildMemberPointsEmbed,
} = require("../ui/memberPoints");
const {
  buildResetConfirmationEmbed,
  buildResetConfirmationRow,
  buildResetSnapshotModal,
  buildResetResultEmbed,
} = require("../ui/resetPoints");
const { getLeaderboard } = require("../services/leaderboardService");
const { getMemberPointsSummary } = require("../services/memberPointsService");
const { resetWeeklyPoints } = require("../services/resetService");
const {
  buildUserSelectRow,
  buildActivitySelectRow,
  buildValueModal,
} = require("../ui/addPoints");
const { addPointsEntry } = require("../services/pointsService");

function parseCustomId(customId) {
  return customId.split(":");
}

async function replyNoPermission(interaction) {
  const payload = {
    content: "Nu ai permisiunea necesară pentru această acțiune.",
    flags: MessageFlags.Ephemeral,
  };

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(payload);
    return;
  }

  await interaction.reply(payload);
}

async function handleAddPointsButton(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  await interaction.reply({
    content: "Alege membrul pentru care vrei să adaugi puncte.",
    components: [buildUserSelectRow()],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleUserSelect(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const targetUserId = interaction.values[0];

  await interaction.update({
    content: "Acum selectează activitatea.",
    components: [buildActivitySelectRow(targetUserId)],
  });
}

async function handleActivitySelect(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const [, targetUserId] = parseCustomId(interaction.customId);
  const activityKey = interaction.values[0];
  const activity = getActivity(activityKey);

  if (!activity) {
    await interaction.reply({
      content: "Activitatea selectată nu există.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (activity.type === "fixed") {
    const targetMember = await interaction.guild.members.fetch(targetUserId);

    const result = await addPointsEntry({
      guildId: interaction.guild.id,
      targetMember,
      activityKey,
      addedByDiscordUserId: interaction.user.id,
    });

    await interaction.update({
      content:
        `✅ Puncte adăugate cu succes.\n\n` +
        `**Membru:** ${targetMember.displayName}\n` +
        `**Activitate:** ${result.activity.label}\n` +
        `**Puncte acordate:** ${result.pointsAwarded}`,
      components: [],
    });

    return;
  }

  const modal = buildValueModal(targetUserId, activityKey);
  await interaction.showModal(modal);
}

async function handleAddPointsModal(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const [, targetUserId, activityKey] = parseCustomId(interaction.customId);

  const targetMember = await interaction.guild.members.fetch(targetUserId);
  const rawValue = interaction.fields.getTextInputValue("value_input");
  const note = interaction.fields.getTextInputValue("note_input") || null;

  const result = await addPointsEntry({
    guildId: interaction.guild.id,
    targetMember,
    activityKey,
    addedByDiscordUserId: interaction.user.id,
    rawValue,
    note,
  });

  const extraInfo =
    result.hours !== null
      ? `**Ore:** ${result.hours}\n`
      : result.quantity !== null
      ? `**Cantitate:** ${result.quantity}\n`
      : "";

  await interaction.reply({
    content:
      `✅ Puncte adăugate cu succes.\n\n` +
      `**Membru:** ${targetMember.displayName}\n` +
      `**Activitate:** ${result.activity.label}\n` +
      `${extraInfo}` +
      `**Puncte acordate:** ${result.pointsAwarded}` +
      (note ? `\n**Notă:** ${note}` : ""),
    flags: MessageFlags.Ephemeral,
  });
}

async function handleLeaderboard(interaction) {
  const entries = await getLeaderboard(100);

  await interaction.reply({
    embeds: [buildLeaderboardEmbed(entries)],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleMemberPointsButton(interaction) {
  await interaction.reply({
    content: "Selectează membrul pe care vrei să-l verifici.",
    components: [buildMemberPointsUserSelectRow()],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleMemberPointsUserSelect(interaction) {
  const targetUserId = interaction.values[0];
  const targetMember = await interaction.guild.members.fetch(targetUserId);
  const summary = await getMemberPointsSummary(targetUserId);

  await interaction.update({
    content: "Aici ai totalul și istoricul punctelor pentru membrul selectat.",
    components: [],
    embeds: [buildMemberPointsEmbed(targetMember, summary)],
  });
}

async function handleResetPointsButton(interaction) {
  if (!canResetPoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  await interaction.reply({
    embeds: [buildResetConfirmationEmbed()],
    components: [buildResetConfirmationRow()],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleConfirmResetPoints(interaction) {
  if (!canResetPoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const modal = buildResetSnapshotModal();
  await interaction.showModal(modal);
}

async function handleResetPointsModal(interaction) {
  if (!canResetPoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const snapshotLabel = interaction.fields
    .getTextInputValue("snapshot_name_input")
    .trim();

  if (!snapshotLabel) {
    await interaction.reply({
      content: "Trebuie să introduci un nume pentru snapshot.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const result = await resetWeeklyPoints({
    guildId: interaction.guild.id,
    resetByDiscordUserId: interaction.user.id,
    snapshotLabel,
  });

  await interaction.reply({
    embeds: [buildResetResultEmbed(result)],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleCancelResetPoints(interaction) {
  if (!canResetPoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  await interaction.update({
    content: "Resetul punctelor a fost anulat.",
    embeds: [],
    components: [],
  });
}

async function handleInteraction(interaction) {
  if (interaction.isButton()) {
    if (interaction.customId === "add_points") {
      await handleAddPointsButton(interaction);
      return;
    }

    if (interaction.customId === "remove_points") {
      if (!canManagePoints(interaction.member)) {
        await replyNoPermission(interaction);
        return;
      }

      await interaction.reply({
        content: "Butonul **Scoate puncte** va fi configurat în pasul următor.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (interaction.customId === "leaderboard") {
      await handleLeaderboard(interaction);
      return;
    }

    if (interaction.customId === "member_points") {
      await handleMemberPointsButton(interaction);
      return;
    }

    if (interaction.customId === "activities_info") {
      await interaction.reply({
        embeds: [buildActivitiesInfoEmbed()],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (interaction.customId === "reset_points") {
      await handleResetPointsButton(interaction);
      return;
    }

    if (interaction.customId === "confirm_reset_points") {
      await handleConfirmResetPoints(interaction);
      return;
    }

    if (interaction.customId === "cancel_reset_points") {
      await handleCancelResetPoints(interaction);
      return;
    }
  }

  if (interaction.isUserSelectMenu()) {
    if (interaction.customId === "add_points_user_select") {
      await handleUserSelect(interaction);
      return;
    }

    if (interaction.customId === "member_points_user_select") {
      await handleMemberPointsUserSelect(interaction);
      return;
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId.startsWith("add_points_activity:")) {
      await handleActivitySelect(interaction);
      return;
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("add_points_modal:")) {
      await handleAddPointsModal(interaction);
      return;
    }

    if (interaction.customId === "reset_points_modal") {
      await handleResetPointsModal(interaction);
      return;
    }
  }
}

module.exports = { handleInteraction };
