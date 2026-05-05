const {
  ActionRowBuilder,
  UserSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

function buildRemoveCreditsUserSelectRow() {
  const userSelect = new UserSelectMenuBuilder()
    .setCustomId("remove_credits_user_select")
    .setPlaceholder("Selectează membrul căruia vrei să-i scoți credite")
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder().addComponents(userSelect);
}

function buildRemoveCreditsModal(targetUserId) {
  const modal = new ModalBuilder()
    .setCustomId(`remove_credits_modal:${targetUserId}`)
    .setTitle("Scoate credite");

  const creditsInput = new TextInputBuilder()
    .setCustomId("credits_input")
    .setLabel("Număr credite de scăzut")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder("Ex: 1");

  const reasonInput = new TextInputBuilder()
    .setCustomId("reason_input")
    .setLabel("Motiv")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)
    .setPlaceholder("Ex: credite consumate / adăugate greșit");

  modal.addComponents(
    new ActionRowBuilder().addComponents(creditsInput),
    new ActionRowBuilder().addComponents(reasonInput)
  );

  return modal;
}

module.exports = {
  buildRemoveCreditsUserSelectRow,
  buildRemoveCreditsModal,
};
