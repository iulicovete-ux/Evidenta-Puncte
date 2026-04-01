const {
  ActionRowBuilder,
  UserSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

function buildMemberPointsUserSelectRow() {
  return new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId("member_points_user_select")
      .setPlaceholder("Alege membrul")
      .setMinValues(1)
      .setMaxValues(1)
  );
}

function formatEntry(entry) {
  const date = new Date(entry.createdAt).toLocaleString("ro-RO");

  let extra = "";
  if (entry.hours !== null) extra = ` • ${entry.hours} ore`;
  if (entry.quantity !== null) extra = ` • ${entry.quantity} cantitate`;

  const ownerLine = entry.addedByDiscordUserId
    ? `Trecut de: <@${entry.addedByDiscordUserId}>`
    : "Trecut de: Necunoscut";

  const noteLine = entry.note ? `\nNotă: ${entry.note}` : "";

  return [
    `• **${entry.activityLabel}** — **${entry.pointsAwarded} pct**${extra}`,
    `Data: ${date}`,
    ownerLine + noteLine,
  ].join("\n");
}

function buildMemberPointsEmbed(targetMember, summary, pageData) {
  const history =
    pageData.entries.length > 0
      ? pageData.entries.map(formatEntry).join("\n\n")
      : "Nu există intrări.";

  return new EmbedBuilder()
    .setTitle(`📌 Fișa membrului ${targetMember.displayName}`)
    .setColor(0x3498db)
    .setDescription(
      [
        `**Total puncte:** **${summary.totalPoints} pct**`,
        "",
        `**Istoric (pagina ${pageData.currentPage}/${pageData.totalPages})**`,
        "",
        history,
      ].join("\n")
    )
    .setFooter({ text: "Registrul familiei" })
    .setTimestamp();
}

function buildPaginationRow(userId, currentPage, totalPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`member_prev:${userId}:${currentPage - 1}`)
      .setLabel("◀")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage <= 1),

    new ButtonBuilder()
      .setCustomId(`member_next:${userId}:${currentPage + 1}`)
      .setLabel("▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages)
  );
}

module.exports = {
  buildMemberPointsUserSelectRow,
  buildMemberPointsEmbed,
  buildPaginationRow,
};
