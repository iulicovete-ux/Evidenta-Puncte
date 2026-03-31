const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

function buildResetConfirmationEmbed() {
  return new EmbedBuilder()
    .setTitle("⚠️ Confirmare reset puncte")
    .setDescription(
      [
        "Ești pe cale să faci resetul săptămânal al punctelor.",
        "",
        "Ce se va întâmpla:",
        "• se salvează snapshot-ul totalurilor curente",
        "• se șterg toate intrările active din perioada curentă",
        "",
        "După confirmare, vei introduce numele snapshot-ului.",
        "",
        "Această acțiune afectează toți membrii serverului.",
      ].join("\n")
    )
    .setColor(0xe67e22)
    .setTimestamp();
}

function buildResetConfirmationRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_reset_points")
      .setLabel("Confirm reset")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("cancel_reset_points")
      .setLabel("Anulează")
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildResetSnapshotModal() {
  const modal = new ModalBuilder()
    .setCustomId("reset_points_modal")
    .setTitle("Nume snapshot reset");

  const snapshotNameInput = new TextInputBuilder()
    .setCustomId("snapshot_name_input")
    .setLabel("Numele snapshot-ului")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)
    .setPlaceholder("Ex: Săptămâna 22 - 28 Martie");

  modal.addComponents(
    new ActionRowBuilder().addComponents(snapshotNameInput)
  );

  return modal;
}

function buildResetResultEmbed(result) {
  return new EmbedBuilder()
    .setTitle("✅ Reset puncte efectuat")
    .setColor(0x2ecc71)
    .addFields(
      {
        name: "Snapshot salvat",
        value: result.batchLabel,
      },
      {
        name: "Membri salvați în snapshot",
        value: `${result.snapshotCount}`,
        inline: true,
      },
      {
        name: "Intrări șterse din perioada curentă",
        value: `${result.deletedEntriesCount}`,
        inline: true,
      }
    )
    .setFooter({
      text: "S-a început o perioadă nouă de punctaj",
    })
    .setTimestamp();
}

module.exports = {
  buildResetConfirmationEmbed,
  buildResetConfirmationRow,
  buildResetSnapshotModal,
  buildResetResultEmbed,
};
