const {
  ActionRowBuilder,
  UserSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

function buildMemberCreditsUserSelectRow() {
  return new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId("member_credits_user_select")
      .setPlaceholder("Alege membrul")
      .setMinValues(1)
      .setMaxValues(1)
  );
}

function formatCreditEntry(entry) {
  const date = new Date(entry.createdAt).toLocaleString("ro-RO");

  const ownerLine = entry.addedByDiscordUserId
    ? `Trecut de: <@${entry.addedByDiscordUserId}>`
    : "Trecut de: Necunoscut";

  const noteLine = entry.note ? `\nNotă: ${entry.note}` : "";

  return [
    `• **${entry.activityLabel}** — **${entry.creditsAwarded} credite**`,
    `Data: ${date}`,
    ownerLine + noteLine,
  ].join("\n");
}

function buildMemberCreditsEmbed(targetMember, summary, pageData) {
  const history =
    pageData.entries.length > 0
      ? pageData.entries.map(formatCreditEntry).join("\n\n")
      : "Nu există intrări.";

  return new EmbedBuilder()
    .setTitle(`💳 Creditele membrului ${targetMember.displayName}`)
    .setColor(0x9b59b6)
    .setDescription(
      [
        `**Total credite:** **${summary.totalCredits}**`,
        "",
        `**Istoric (pagina ${pageData.currentPage}/${pageData.totalPages})**`,
        "",
        history,
      ].join("\n")
    )
    .setFooter({ text: "Registrul familiei" })
    .setTimestamp();
}

function buildCreditsPaginationRow(userId, currentPage, totalPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`credits_prev:${userId}:${currentPage - 1}`)
      .setLabel("◀")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage <= 1),

    new ButtonBuilder()
      .setCustomId(`credits_next:${userId}:${currentPage + 1}`)
      .setLabel("▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= totalPages)
  );
}

module.exports = {
  buildMemberCreditsUserSelectRow,
  buildMemberCreditsEmbed,
  buildCreditsPaginationRow,
};
