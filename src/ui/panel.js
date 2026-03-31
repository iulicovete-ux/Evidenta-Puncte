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
        "Folosește butoanele de mai jos pentru a gestiona punctele membrilor.",
        "",
        "• **Adaugă puncte** — înregistrează o activitate nouă",
        "• **Scoate puncte** — aplică o corecție negativă",
        "• **Verifică puncte** — vezi totalul unui membru",
        "• **Reset puncte** — reset general pentru toți membrii",
      ].join("\n")
    )
    .setColor(0x00ae86)
    .setFooter({ text: "Sistem evidență puncte FiveM RP" })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("add_points")
      .setLabel("Adaugă puncte")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("remove_points")
      .setLabel("Scoate puncte")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("check_points")
      .setLabel("Verifică puncte")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("reset_points")
      .setLabel("Reset puncte")
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [row],
  };
}

module.exports = { buildMainPanel };
