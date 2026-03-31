const { EmbedBuilder } = require("discord.js");

function buildLeaderboardEmbed(entries) {
  const description =
    entries.length > 0
      ? entries
          .map(
            (entry) =>
              `**#${entry.rank}** — ${entry.displayName} • **${entry.totalPoints} pct**`
          )
          .join("\n")
      : "Nu există încă puncte înregistrate.";

  return new EmbedBuilder()
    .setTitle("🏆 Leaderboard")
    .setDescription(description)
    .setColor(0xf1c40f)
    .setFooter({ text: "Clasament general după punctele acumulate" })
    .setTimestamp();
}

module.exports = {
  buildLeaderboardEmbed,
};
