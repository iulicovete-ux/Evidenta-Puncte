const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

function buildResetConfirmationEmbed() {
  return new EmbedBuilder()
    .setTitle("⚠️ Închidere săptămână")
    .setDescription(
      [
        "Ești pe cale să închizi evidența punctelor pentru perioada curentă.",
        "",
        "**Ce se va întâmpla:**",
        "• totalurile membrilor vor fi salvate",
        "• registrul actual va fi golit pentru o nouă perioadă",
        "",
        "Înainte de finalizare, vei da un nume acestei perioade.",
        "",
        "Această hotărâre îi privește pe toți membrii familiei.",
      ].join("\n")
    )
    .setColor(0xf1c40f)
    .setTimestamp();
}

function buildResetConfirmationRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_reset_points")
      .setLabel("Închide săptămâna")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("cancel_reset_points")
      .setLabel("Renunță")
      .setStyle(ButtonStyle.Secondary)
  );
}

function buildResetSnapshotModal() {
  const modal = new ModalBuilder()
    .setCustomId("reset_points_modal")
    .setTitle("Numele perioadei");

  const snapshotNameInput = new TextInputBuilder()
    .setCustomId("snapshot_name_input")
    .setLabel("Cum vrei să rămână trecută perioada")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)
    .setPlaceholder("Ex: Săptămâna 25 - 31 Martie");

  modal.addComponents(
    new ActionRowBuilder().addComponents(snapshotNameInput)
  );

  return modal;
}

function buildResetResultEmbed(result) {
  return new EmbedBuilder()
    .setTitle("✅ Săptămâna a fost închisă")
    .setColor(0x2ecc71)
    .addFields(
      {
        name: "Perioadă salvată",
        value: result.batchLabel,
      },
      {
        name: "Membri trecuți în arhivă",
        value: `${result.snapshotCount}`,
        inline: true,
      },
      {
        name: "Înregistrări curățate din registru",
        value: `${result.deletedEntriesCount}`,
        inline: true,
      }
    )
    .setFooter({
      text: "Registrul este pregătit pentru o nouă perioadă",
    })
    .setTimestamp();
}

module.exports = {
  buildResetConfirmationEmbed,
  buildResetConfirmationRow,
  buildResetSnapshotModal,
  buildResetResultEmbed,
};
