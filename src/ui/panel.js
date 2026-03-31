const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

function buildMainPanel() {
  const embed = new EmbedBuilder()
    .setTitle("📜 Registrul familiei")
    .setDescription(
      [
        "Aici este ținută evidența contribuției fiecărui membru.",
        "Din acest registru poți trece activități, verifica situația unui om, consulta clasamentul actual sau răsfoi arhiva săptămânilor trecute.",
        "",
        "• **Adaugă în registru** — notezi o activitate nouă pentru un membru",
        "• **Scade din registru** — corectezi o evidență trecută greșit",
        "• **Clasamentul familiei** — vezi ordinea membrilor după contribuție",
        "• **Fișa unui membru** — vezi totalul și evidența lui curentă",
        "• **Arhiva familiei** — vezi săptămânile salvate după ședință",
        "• **Activități recunoscute** — vezi ce contribuții sunt luate în seamă și cât valorează",
        "• **Închide săptămâna** — salvezi situația actuală și deschizi o perioadă nouă",
      ].join("\n")
    )
    .setColor(0x00ae86)
    .setFooter({ text: "Evidența internă a familiei" })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("add_points")
      .setLabel("Adaugă în registru")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("remove_points")
      .setLabel("Scade din registru")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("leaderboard")
      .setLabel("Clasamentul familiei")
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("member_points")
      .setLabel("Fișa unui membru")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("points_history")
      .setLabel("Arhiva familiei")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("activities_info")
      .setLabel("Activități recunoscute")
      .setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("reset_points")
      .setLabel("Închide săptămâna")
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    embeds: [embed],
    components: [row1, row2, row3],
  };
}

module.exports = { buildMainPanel };
