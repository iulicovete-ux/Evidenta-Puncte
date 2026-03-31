const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
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

function buildResetResultEmbed(result) {
  const preview =
    result.snapshotRows.length > 0
      ? result.snapshotRows
          .slice(0, 10)
          .map(
            (row, index) =>
              `**#${index + 1}** — ${row.displayName}: **${row.totalPoints} pct** (${row.entriesCount} intrări)`
          )
          .join("\n")
      : "Nu au existat puncte active de arhivat.";

  return new EmbedBuilder()
    .setTitle("✅ Reset puncte efectuat")
    .setColor(0x2ecc71)
    .addFields(
      {
        name: "Membri salvați în snapshot",
        value: `${result.snapshotCount}`,
        inline: true,
      },
      {
        name: "Intrări șterse din perioada curentă",
        value: `${result.deletedEntriesCount}`,
        inline: true,
      },
      {
        name: "Preview snapshot",
        value: preview,
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
  buildResetResultEmbed,
};
