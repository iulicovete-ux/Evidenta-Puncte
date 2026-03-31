const { EmbedBuilder } = require("discord.js");
const { getAllActivities } = require("../config/activities");

function buildActivitiesInfoEmbed() {
  const activities = getAllActivities();

  const fixed = [];
  const hourly = [];
  const quantity = [];

  for (const [, activity] of Object.entries(activities)) {
    if (activity.type === "fixed") {
      fixed.push(`• **${activity.label}** — ${activity.points} pct`);
    }

    if (activity.type === "hourly") {
      hourly.push(`• **${activity.label}** — ${activity.pointsPerUnit} pct / oră`);
    }

    if (activity.type === "quantity") {
      quantity.push(
        `• **${activity.label}** — ${activity.unitSize} unități = ${activity.pointsPerUnit} pct`
      );
    }
  }

  const embed = new EmbedBuilder()
    .setTitle("📋 Activități & puncte")
    .setColor(0x5865f2)
    .addFields(
      {
        name: "Activități cu punctaj fix",
        value: fixed.join("\n") || "Nu există.",
      },
      {
        name: "Activități pe oră",
        value: hourly.join("\n") || "Nu există.",
      },
      {
        name: "Activități pe cantitate",
        value: quantity.join("\n") || "Nu există.",
      }
    )
    .setFooter({
      text: "Reguli: ore întregi • livrările se acceptă doar în multipli de 50",
    })
    .setTimestamp();

  return embed;
}

module.exports = { buildActivitiesInfoEmbed };
