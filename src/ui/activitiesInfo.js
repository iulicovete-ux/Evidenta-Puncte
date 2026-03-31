const { EmbedBuilder } = require("discord.js");
const { getAllActivities } = require("../config/activities");

function buildActivitiesInfoEmbed() {
  const activities = getAllActivities();

  const fixed = [];
  const hourly = [];
  const deliveries = [];
  const donations = [];

  for (const [, activity] of Object.entries(activities)) {
    if (activity.type === "fixed") {
      fixed.push(`• **${activity.label}** — ${activity.points} pct`);
    }

    if (activity.type === "hourly") {
      hourly.push(`• **${activity.label}** — ${activity.pointsPerUnit} pct / oră`);
    }

    if (activity.type === "delivery_quantity") {
      for (const [, option] of Object.entries(activity.options)) {
        deliveries.push(
          `• **${activity.label} - ${option.label}** — ${option.unitSize} buc = ${option.pointsPerUnit} pct`
        );
      }
    }

    if (activity.type === "donation_family") {
      for (const [, option] of Object.entries(activity.options)) {
        donations.push(`• **${option.label}** — ${option.points} pct`);
      }
    }
  }

  const embed = new EmbedBuilder()
    .setTitle("📋 Activități & puncte")
    .setColor(0x5865f2)
    .addFields(
      {
        name: "Donații familie",
        value: donations.join("\n") || "Nu există.",
      },
      {
        name: "Activități cu punctaj fix",
        value: fixed.join("\n") || "Nu există.",
      },
      {
        name: "Activități pe oră",
        value: hourly.join("\n") || "Nu există.",
      },
      {
        name: "Livrări pe cantitate",
        value: deliveries.join("\n") || "Nu există.",
      }
    )
    .setFooter({
      text: "Reguli: ore întregi • Meta în multipli de 50 • Carduri/LSD în multipli de 35",
    })
    .setTimestamp();

  return embed;
}

module.exports = { buildActivitiesInfoEmbed };
