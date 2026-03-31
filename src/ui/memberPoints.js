const {
  ActionRowBuilder,
  UserSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");

function buildMemberPointsUserSelectRow() {
  const userSelect = new UserSelectMenuBuilder()
    .setCustomId("member_points_user_select")
    .setPlaceholder("Selectează membrul pe care vrei să-l verifici")
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder().addComponents(userSelect);
}

function formatEntry(entry) {
  const date = new Date(entry.createdAt).toLocaleString("ro-RO");

  let extra = "";
  if (entry.hours !== null) {
    extra = ` • ${entry.hours} ore`;
  } else if (entry.quantity !== null) {
    extra = ` • ${entry.quantity} cantitate`;
  }

  const noteText = entry.note ? `\nNotă: ${entry.note}` : "";

  return `• **${entry.activityLabel}** — **${entry.pointsAwarded} pct**${extra}\nData: ${date}${noteText}`;
}

function buildMemberPointsEmbed(targetMember, summary) {
  const historyText =
    summary.entries.length > 0
      ? summary.entries.map(formatEntry).join("\n\n")
      : "Nu există încă intrări active pentru acest membru.";

  return new EmbedBuilder()
    .setTitle("📌 Punctele unui membru")
    .setColor(0x3498db)
    .addFields(
      {
        name: "Membru",
        value: targetMember.displayName,
        inline: true,
      },
      {
        name: "Total puncte",
        value: `${summary.totalPoints} pct`,
        inline: true,
      },
      {
        name: "Istoric curent",
        value: historyText,
      }
    )
    .setFooter({
      text: "Sunt afișate ultimele 20 de intrări active din perioada curentă",
    })
    .setTimestamp();
}

module.exports = {
  buildMemberPointsUserSelectRow,
  buildMemberPointsEmbed,
};
