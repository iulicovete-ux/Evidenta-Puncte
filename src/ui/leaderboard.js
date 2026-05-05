const { EmbedBuilder } = require("discord.js");

function buildLeaderboardEmbed(entries, type = "points") {
  const isCredits = type === "credits";

  const description =
    entries.length > 0
      ? entries
          .map((entry) => {
            const value = isCredits ? entry.totalCredits : entry.totalPoints;
            const label = isCredits ? "credite" : "pct";

            return `**#${entry.rank}** — ${entry.displayName} • **${value} ${label}**`;
          })
          .join("\n")
      : isCredits
      ? "Nu există încă credite înregistrate."
      : "Nu există încă puncte înregistrate.";

  return new EmbedBuilder()
    .setTitle(isCredits ? "💰 Clasament Credite" : "🏆 Clasament Puncte")
    .setDescription(description)
    .setColor(isCredits ? 0x00bcd4 : 0xf1c40f)
    .setFooter({
      text: isCredits
        ? "Clasament general după creditele acumulate"
        : "Clasament general după punctele acumulate",
    })
    .setTimestamp();
}

module.exports = {
  buildLeaderboardEmbed,
};
