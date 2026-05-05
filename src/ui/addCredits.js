const {
  ActionRowBuilder,
  UserSelectMenuBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { getAllCreditActivities } = require("../config/creditActivities");

function buildAddCreditsUserSelectRow() {
  const userSelect = new UserSelectMenuBuilder()
    .setCustomId("add_credits_user_select")
    .setPlaceholder("Alege membrul")
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder().addComponents(userSelect);
}

function buildCreditActivitySelectRow(targetUserId) {
  const activities = getAllCreditActivities();

  const options = Object.entries(activities).map(([key, value]) => ({
    label: value.label,
    value: key,
    description: `${value.credits} credit`,
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`add_credits_activity:${targetUserId}`)
    .setPlaceholder("Alege activitatea")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
}

module.exports = {
  buildAddCreditsUserSelectRow,
  buildCreditActivitySelectRow,
};
