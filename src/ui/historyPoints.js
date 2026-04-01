const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

function buildSnapshotSelectRow(batches) {
  const options = batches.slice(0, 25).map((batch) => {
    const dateText = new Date(batch.createdAt).toLocaleDateString("ro-RO");

    return {
      label: batch.label.slice(0, 100),
      value: `snapshot:${batch.id}`,
      description: `${batch.membersCount} membri • ${dateText}`.slice(0, 100),
    };
  });

  const select = new StringSelectMenuBuilder()
    .setCustomId("points_history_snapshot_select")
    .setPlaceholder("Alege perioada")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(select);
}

function buildNoSnapshotsEmbed() {
  return new EmbedBuilder()
    .setTitle("📁 Istoric puncte")
    .setDescription("Nu există încă perioade salvate.")
    .setColor(0x95a5a6)
    .setTimestamp();
}

function buildSnapshotEntriesEmbed(batch, snapshotPage) {
  const entries =
    snapshotPage.entries.length > 0
      ? snapshotPage.entries
          .map(
            (entry) =>
              `#${entry.rank} — ${entry.displayName} • **${entry.totalPoints} pct** (${entry.entriesCount} intrări)`
          )
          .join("\n")
      : "Nu există date pentru această perioadă.";

  return new EmbedBuilder()
    .setTitle(`📁 Istoric puncte pentru ${batch.label}`)
    .setColor(0x9b59b6)
    .addFields(
      {
        name: "Membri",
        value: `${snapshotPage.totalCount}`,
        inline: true,
      },
      {
        name: "Pagină",
        value: `${snapshotPage.currentPage}/${snapshotPage.totalPages}`,
        inline: true,
      },
      {
        name: "Clasament",
        value: entries,
      }
    )
    .setFooter({
      text: `Creat la ${new Date(batch.createdAt).toLocaleString("ro-RO")}`,
    })
    .setTimestamp();
}

function buildSnapshotPaginationRow(batchId, currentPage, totalPages) {
  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`history_prev:${batchId}:${previousPage}`)
      .setLabel("Înapoi")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage <= 1),

    new ButtonBuilder()
      .setCustomId(`history_next:${batchId}:${nextPage}`)
      .setLabel("Înainte")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages)
  );
}

module.exports = {
  buildSnapshotSelectRow,
  buildNoSnapshotsEmbed,
  buildSnapshotEntriesEmbed,
  buildSnapshotPaginationRow,
};
