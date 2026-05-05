const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

function buildResetCreditsConfirmEmbed() {
  return new EmbedBuilder()
    .setTitle("⚠️ Confirmare resetare credite")
    .setDescription(
      [
        "Ești sigur că vrei să resetezi toate creditele membrilor?",
        "",
        "Această acțiune va șterge toate intrările de credite din baza de date.",
        "Acțiunea nu poate fi anulată.",
      ].join("\n")
    )
    .setColor("Red");
}

function buildResetCreditsButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_reset_credits")
      .setLabel("Confirmă resetarea")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("cancel_reset_credits")
      .setLabel("Anulează")
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildResetCreditsSuccessEmbed(deletedRows = 0) {
  return new EmbedBuilder()
    .setTitle("✅ Credite resetate")
    .setDescription(
      `Toate creditele au fost resetate.\n\nIntrări șterse: **${deletedRows}**`
    )
    .setColor("Green");
}

function buildResetCreditsCancelEmbed() {
  return new EmbedBuilder()
    .setTitle("Resetare anulată")
    .setDescription("Creditele membrilor nu au fost modificate.")
    .setColor("Grey");
}

module.exports = {
  buildResetCreditsConfirmEmbed,
  buildResetCreditsButtons,
  buildResetCreditsSuccessEmbed,
  buildResetCreditsCancelEmbed,
};
