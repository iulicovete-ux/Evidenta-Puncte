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
      fixed.push(`• ${activity.label} — **${activity.points} pct**`);
    }

    if (activity.type === "hourly") {
      hourly.push(`• ${activity.label} — **${activity.pointsPerUnit} pct / oră**`);
    }

    if (activity.type === "delivery_quantity") {
      for (const [, option] of Object.entries(activity.options)) {
        deliveries.push(
          `• ${activity.label} - ${option.label} — **${option.unitSize} buc = ${option.pointsPerUnit} pct**`
        );
      }
    }

    if (activity.type === "donation_family") {
      for (const [, option] of Object.entries(activity.options)) {
        donations.push(`• ${option.label} — **${option.points} pct**`);
      }
    }
  }

  const embed = new EmbedBuilder()
    .setTitle("📜 Contribuții recunoscute în familie")
    .setColor(0x5865f2)

    .addFields(
      {
        name: "💰 Donații familie",
        value: donations.join("\n") || "—",
      },
      {
        name: "📌 Activități directe",
        value: fixed.join("\n") || "—",
      },
      {
        name: "⏱️ Activități în timp",
        value: hourly.join("\n") || "—",
      },
      {
        name: "📦 Livrări",
        value: deliveries.join("\n") || "—",
      },
      {
        name: "⚖️ Reguli de evidență",
        value:
          [
            "• Orele sunt calculate doar în valori întregi",
            "• Meta este luată în calcul doar în multipli de **50**",
            "• Carduri / LSD doar în multipli de **35**",
          ].join("\n"),
      }
    )

    .setFooter({
      text: "Registrul familiei",
    })
    .setTimestamp();

  return embed;
}

module.exports = { buildActivitiesInfoEmbed };
