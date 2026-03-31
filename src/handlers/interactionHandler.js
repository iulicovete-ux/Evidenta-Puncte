const { getActivity } = require("../config/activities");
const {
  buildUserSelectRow,
  buildActivitySelectRow,
  buildValueModal,
} = require("../ui/addPoints");
const { addPointsEntry } = require("../services/pointsService");

function parseCustomId(customId) {
  return customId.split(":");
}

async function handleAddPointsButton(interaction) {
  await interaction.reply({
    content: "Alege membrul pentru care vrei să adaugi puncte.",
    components: [buildUserSelectRow()],
    ephemeral: true,
  });
}

async function handleUserSelect(interaction) {
  const targetUserId = interaction.values[0];

  await interaction.update({
    content: "Acum selectează activitatea.",
    components: [buildActivitySelectRow(targetUserId)],
  });
}

async function handleActivitySelect(interaction) {
  const [, targetUserId] = parseCustomId(interaction.customId);
  const activityKey = interaction.values[0];
  const activity = getActivity(activityKey);

  if (!activity) {
    await interaction.reply({
      content: "Activitatea selectată nu există.",
      ephemeral: true,
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
    ephemeral: true,
  });
}

async function handleInteraction(interaction) {
  if (interaction.isButton()) {
    if (interaction.customId === "add_points") {
      await handleAddPointsButton(interaction);
      return;
    }

    if (interaction.customId === "remove_points") {
      await interaction.reply({
        content: "Butonul **Scoate puncte** va fi configurat în pasul următor.",
        ephemeral: true,
      });
      return;
    }

    if (interaction.customId === "check_points") {
      await interaction.reply({
        content: "Butonul **Verifică puncte** va fi configurat în pasul următor.",
        ephemeral: true,
      });
      return;
    }

    if (interaction.customId === "reset_points") {
      await interaction.reply({
        content: "Butonul **Reset puncte** va fi configurat în pasul următor.",
        ephemeral: true,
      });
      return;
    }
  }

  if (interaction.isUserSelectMenu()) {
    if (interaction.customId === "add_points_user_select") {
      await handleUserSelect(interaction);
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
    }
  }
}

module.exports = { handleInteraction };
