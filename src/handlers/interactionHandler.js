const { MessageFlags } = require("discord.js");
const {
  getActivity,
  getDonationOption,
  getDeliveryOption,
} = require("../config/activities");
const { canManagePoints, canResetPoints } = require("../config/permissions");
const { buildActivitiesInfoEmbed } = require("../ui/activitiesInfo");
const { buildLeaderboardEmbed } = require("../ui/leaderboard");
const {
  buildMemberPointsUserSelectRow,
  buildMemberPointsEmbed,
  buildPaginationRow,
} = require("../ui/memberPoints");
const {
  buildResetConfirmationEmbed,
  buildResetConfirmationRow,
  buildResetSnapshotModal,
  buildResetResultEmbed,
} = require("../ui/resetPoints");
const {
  buildSnapshotSelectRow,
  buildNoSnapshotsEmbed,
  buildSnapshotEntriesEmbed,
  buildSnapshotPaginationRow,
} = require("../ui/historyPoints");
const {
  buildRemovePointsUserSelectRow,
  buildRemovePointsModal,
} = require("../ui/removePoints");
const { getLeaderboard } = require("../services/leaderboardService");
const {
  getMemberPointsSummary,
  getMemberPointsPage,
} = require("../services/memberPointsService");
const { resetWeeklyPoints } = require("../services/resetService");
const {
  getSnapshotBatches,
  getSnapshotBatchById,
  getSnapshotEntries,
} = require("../services/historyService");
const {
  buildUserSelectRow,
  buildActivitySelectRow,
  buildDonationSelectRow,
  buildDeliverySelectRow,
  buildValueModal,
  buildRequiredNoteModal,
} = require("../ui/addPoints");
const {
  addPointsEntry,
  addNegativeAdjustmentEntry,
} = require("../services/pointsService");

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
    content: "Alege membrul pentru care vrei să treci o activitate.",
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
    content: "Alege activitatea pe care vrei să o treci în registru.",
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
      content: "Activitatea selectata nu exista.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (activity.type === "donation_family") {
    await interaction.update({
      content: "Alege ce a fost adus pentru familie.",
      components: [buildDonationSelectRow(targetUserId, activityKey)],
    });
    return;
  }

  if (activity.type === "delivery_quantity") {
    await interaction.update({
      content: "Alege tipul livrarii.",
      components: [buildDeliverySelectRow(targetUserId, activityKey)],
    });
    return;
  }

  if (activity.type === "fixed_with_required_note") {
    const modal = buildRequiredNoteModal(targetUserId, activityKey);
    await interaction.showModal(modal);
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
        "Activitatea a fost trecuta in registru.\n\n" +
        Membru: ${targetMember.displayName}\n +
        Activitate: ${result.activityLabelSnapshot}\n +
        Puncte acordate: ${result.pointsAwarded}\n +
        Trecut de: <@${interaction.user.id}>,
      components: [],
    });

    return;
  }

  const modal = buildValueModal(targetUserId, activityKey);
  await interaction.showModal(modal);
}

async function handleDonationSelect(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const [, targetUserId, activityKey] = parseCustomId(interaction.customId);
  const donationKey = interaction.values[0];

  const donationOption = getDonationOption(activityKey, donationKey);

  if (!donationOption) {
    await interaction.reply({
      content: "Obiectul donat selectat nu exista.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (donationOption.mode === "quantity") {
    const modal = buildValueModal(targetUserId, activityKey, donationKey);
    await interaction.showModal(modal);
    return;
  }

  const targetMember = await interaction.guild.members.fetch(targetUserId);

  const result = await addPointsEntry({
    guildId: interaction.guild.id,
    targetMember,
    activityKey,
    addedByDiscordUserId: interaction.user.id,
    optionKey: donationKey,
  });

  await interaction.update({
    content:
      "Activitatea a fost trecuta in registru.\n\n" +
      Membru: ${targetMember.displayName}\n +
      Activitate: ${result.activityLabelSnapshot}\n +
      Puncte acordate: ${result.pointsAwarded}\n +
      Trecut de: <@${interaction.user.id}>,
    components: [],
  });
}

async function handleDeliverySelect(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const [, targetUserId, activityKey] = parseCustomId(interaction.customId);
  const deliveryOptionKey = interaction.values[0];

  const deliveryOption = getDeliveryOption(activityKey, deliveryOptionKey);

  if (!deliveryOption) {
    await interaction.reply({
      content: "Tipul livrării selectat nu există.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const modal = buildValueModal(targetUserId, activityKey, deliveryOptionKey);
  await interaction.showModal(modal);
}

async function handleAddPointsModal(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const parts = parseCustomId(interaction.customId);
  const [, targetUserId, activityKey, optionKey = null] = parts;

  const targetMember = await interaction.guild.members.fetch(targetUserId);
  const rawValue = interaction.fields.getTextInputValue("value_input");
  const note = interaction.fields.getTextInputValue("note_input") || null;

  const result = await addPointsEntry({
    guildId: interaction.guild.id,
    targetMember,
    activityKey,
    addedByDiscordUserId: interaction.user.id,
    rawValue,
    optionKey,
    note,
  });

  const extraInfo =
    result.hours !== null
      ? Ore: ${result.hours}\n
      : result.quantity !== null
      ? Cantitate: ${result.quantity}\n
      : "";

  await interaction.reply({
    content:
      "Activitatea a fost trecuta in registru.\n\n" +
      Membru: ${targetMember.displayName}\n +
      Activitate: ${result.activityLabelSnapshot}\n +
      ${extraInfo} +
      Puncte acordate: ${result.pointsAwarded}\n +
      Trecut de: <@${interaction.user.id}> +
      (note ? \nNota: ${note} : ""),
    flags: MessageFlags.Ephemeral,
  });
}

async function handleRequiredNoteModal(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const [, targetUserId, activityKey] = parseCustomId(interaction.customId);
  const targetMember = await interaction.guild.members.fetch(targetUserId);
  const requiredNote = interaction.fields
    .getTextInputValue("required_note_input")
    .trim();

  const result = await addPointsEntry({
    guildId: interaction.guild.id,
    targetMember,
    activityKey,
    addedByDiscordUserId: interaction.user.id,
    note: requiredNote,
  });

  await interaction.reply({
    content:
      "Activitatea a fost trecuta in registru.\n\n" +
      Membru: ${targetMember.displayName}\n +
      Activitate: ${result.activityLabelSnapshot}\n +
      Puncte acordate: ${result.pointsAwarded}\n +
      Trecut de: <@${interaction.user.id}>\n +
      Descriere: ${requiredNote},
    flags: MessageFlags.Ephemeral,
  });
}

async function handleRemovePointsButton(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  await interaction.reply({
    content: "Selectează membrul căruia vrei să-i scoți puncte.",
    components: [buildRemovePointsUserSelectRow()],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleRemovePointsUserSelect(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const targetUserId = interaction.values[0];
  const modal = buildRemovePointsModal(targetUserId);
  await interaction.showModal(modal);
}

async function handleRemovePointsModal(interaction) {
  if (!canManagePoints(interaction.member)) {
    await replyNoPermission(interaction);
    return;
  }

  const [, targetUserId] = parseCustomId(interaction.customId);
  const targetMember = await interaction.guild.members.fetch(targetUserId);

  const pointsInput = interaction.fields.getTextInputValue("points_input");
  const reasonInput = interaction.fields.getTextInputValue("reason_input");

  const result = await addNegativeAdjustmentEntry({
    guildId: interaction.guild.id,
    targetMember,
    removedByDiscordUserId: interaction.user.id,
    pointsToRemove: pointsInput,
    reason: reasonInput,
  });

  await interaction.reply({
    content:
      ✔️ Registrul a fost corectat.\n\n +
      **Membru:** ${targetMember.displayName}\n +
      **Puncte scăzute:** ${result.pointsRemoved}\n +
      **Motiv:** ${result.reason}\n +
      **Trecut de:** <@${interaction.user.id}>,
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
    content: "Alege membrul pe care vrei să-l verifici.",
    components: [buildMemberPointsUserSelectRow()],
    flags: MessageFlags.Ephemeral,
  });
}

async function handleMemberPointsUserSelect(interaction) {
  const userId = interaction.values[0];
  const member = await interaction.guild.members.fetch(userId);

  const summary = await getMemberPointsSummary(userId);
  const pageData = await getMemberPointsPage(userId, 1);

  await interaction.update({
    content: "Aici ai totalul și evidența trecută în registru pentru membrul ales.",
    embeds: [buildMemberPointsEmbed(member, summary, pageData)],
    components: [buildPaginationRow(userId, 1, pageData.totalPages)],
  });
}

async function handleMemberPagination(interaction) {
  const [, userId, pageRaw] = interaction.customId.split(":");
  const page = Number(pageRaw);

  const member = await interaction.guild.members.fetch(userId);
  const summary = await getMemberPointsSummary(userId);
  const pageData = await getMemberPointsPage(userId, page);

  await interaction.update({
    content: "Aici ai totalul și evidența trecută în registru pentru membrul ales.",
    embeds: [buildMemberPointsEmbed(member, summary, pageData)],
    components: [buildPaginationRow(userId, pageData.currentPage, pageData.totalPages)],
  });
}

async function handlePointsHistoryButton(interaction) {
  const batches = await getSnapshotBatches(interaction.guild.id, 25);

  if (batches.length === 0) {
    await interaction.reply({
      embeds: [buildNoSnapshotsEmbed()],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply({
    content: "Alege săptămâna pe care vrei să o răsfoiești.",
    components: [buildSnapshotSelectRow(batches)],
    flags: MessageFlags.Ephemeral,
  });
}

async function showSnapshotPage(interaction, batchId, page) {
  const batch = await getSnapshotBatchById(batchId);

  if (!batch) {
    const payload = {
      content: "Perioada selectată nu mai există.",
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
      return;
    }

    await interaction.reply(payload);
    return;
  }

  const snapshotPage = await getSnapshotEntries(batchId, page, 10);

  await interaction.update({
    content: null,
    embeds: [buildSnapshotEntriesEmbed(batch, snapshotPage)],
    components: [
      buildSnapshotPaginationRow(
        batchId,
        snapshotPage.currentPage,
        snapshotPage.totalPages
      ),
    ],
  });
}

async function handleSnapshotSelect(interaction) {
  const selectedValue = interaction.values[0];
  const [, batchIdRaw] = selectedValue.split(":");
  const batchId = Number(batchIdRaw);

  if (!Number.isInteger(batchId)) {
    await interaction.update({
      content: "Perioadă invalidă.",
      embeds: [],
      components: [],
    });
    return;
  }

  await showSnapshotPage(interaction, batchId, 1);
}

async function handleHistoryPagination(interaction) {
  const [, batchIdRaw, pageRaw] = parseCustomId(interaction.customId);
  const batchId = Number(batchIdRaw);
  const page = Number(pageRaw);

  if (!Number.isInteger(batchId) || !Number.isInteger(page) || page <= 0) {
    await interaction.reply({
      content: "Pagina solicitată este invalidă.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await showSnapshotPage(interaction, batchId, page);
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
      content: "Trebuie să introduci un nume pentru perioadă.",
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
    content: "Închiderea săptămânii a fost anulată.",
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
      await handleRemovePointsButton(interaction);
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

    if (interaction.customId === "points_history") {
      await handlePointsHistoryButton(interaction);
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

    if (
      interaction.customId.startsWith("history_prev:") ||
      interaction.customId.startsWith("history_next:")
    ) {
      await handleHistoryPagination(interaction);
      return;
    }

    if (
      interaction.customId.startsWith("member_prev:") ||
      interaction.customId.startsWith("member_next:")
    ) {
      await handleMemberPagination(interaction);
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

    if (interaction.customId === "remove_points_user_select") {
      await handleRemovePointsUserSelect(interaction);
      return;
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId.startsWith("add_points_activity:")) {
      await handleActivitySelect(interaction);
      return;
    }

    if (interaction.customId.startsWith("add_points_donation:")) {
      await handleDonationSelect(interaction);
      return;
    }

    if (interaction.customId.startsWith("add_points_delivery:")) {
      await handleDeliverySelect(interaction);
      return;
    }

    if (interaction.customId === "points_history_snapshot_select") {
      await handleSnapshotSelect(interaction);
      return;
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("add_points_required_note_modal:")) {
      await handleRequiredNoteModal(interaction);
      return;
    }

    if (interaction.customId.startsWith("add_points_modal:")) {
      await handleAddPointsModal(interaction);
      return;
    }

    if (interaction.customId.startsWith("remove_points_modal:")) {
      await handleRemovePointsModal(interaction);
      return;
    }

    if (interaction.customId === "reset_points_modal") {
      await handleResetPointsModal(interaction);
      return;
    }
  }
}

module.exports = { handleInteraction };
