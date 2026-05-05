const {
  ActionRowBuilder,
  UserSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

function buildRemovePointsUserSelectRow() {
  const userSelect = new UserSelectMenuBuilder()
    .setCustomId("remove_points_user_select")
    .setPlaceholder("Selectează membrul căruia vrei să-i scoți puncte")
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder().addComponents(userSelect);
}

function buildRemovePointsModal(targetUserId) {
  const modal = new ModalBuilder()
    .setCustomId(`remove_points_modal:${targetUserId}`)
    .setTitle("Scoate puncte");

  const pointsInput = new TextInputBuilder()
    .setCustomId("points_input")
    .setLabel("Număr puncte de scăzut")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder("Ex: 2");

  const reasonInput = new TextInputBuilder()
    .setCustomId("reason_input")
    .setLabel("Motiv")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)
    .setPlaceholder("Ex: puncte introduse greșit");

  modal.addComponents(
    new ActionRowBuilder().addComponents(pointsInput),
    new ActionRowBuilder().addComponents(reasonInput)
  );

  return modal;
}

module.exports = {
  buildRemovePointsUserSelectRow,
  buildRemovePointsModal,
};
