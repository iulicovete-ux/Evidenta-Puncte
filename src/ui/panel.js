const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

function buildMainPanel() {
  const embed = new EmbedBuilder()
    .setTitle("📊 Evidență Puncte")
    .setDescription(
      [
        "Folosește butoanele de mai jos pentru a gestiona sau verifica sistemul de puncte.",
        "",
        "• **Adaugă puncte** — înregistrează o activitate nouă",
        "• **Scoate puncte** — aplică o corecție negativă",
        "• **Leaderboard** — vezi clasamentul membrilor",
        "• **Activități & puncte** — vezi toate activitățile și punctajele",
        "• **Reset puncte** — reset general pentru toți membrii",
      ].join("\n")
    )
    .setColor(0x00ae86)
    .setFooter({ text: "Sistem evidență puncte FiveM RP" })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("add_points")
      .setLabel("Adaugă puncte")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("remove_points")
      .setLabel("Scoate puncte")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("leaderboard")
      .setLabel("Leaderboard")
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("activities_info")
      .setLabel("Activități & puncte")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("reset_points")
      .setLabel("Reset puncte")
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [row1, row2],
  };
}

module.exports = { buildMainPanel };
