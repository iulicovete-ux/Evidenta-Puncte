const {
  ActionRowBuilder,
  UserSelectMenuBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { getAllActivities, getActivity } = require("../config/activities");

function buildUserSelectRow() {
  const userSelect = new UserSelectMenuBuilder()
    .setCustomId("add_points_user_select")
    .setPlaceholder("Selectează membrul pentru care vrei să adaugi puncte")
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder().addComponents(userSelect);
}

function buildActivitySelectRow(targetUserId) {
  const activities = getAllActivities();

  const options = Object.entries(activities).map(([key, value]) => {
    let description = "Selectează activitatea";

    if (value.type === "fixed") {
      description = `${value.points} pct`;
    } else if (value.type === "hourly") {
      description = `${value.pointsPerUnit} pct / oră`;
    } else if (value.type === "quantity") {
      description = `${value.unitSize} unități = ${value.pointsPerUnit} pct`;
    } else if (value.type === "donation_family") {
      description = "Selectezi apoi obiectul donat";
    }

    return {
      label: value.label,
      value: key,
      description,
    };
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`add_points_activity:${targetUserId}`)
    .setPlaceholder("Selectează activitatea")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
}

function buildDonationSelectRow(targetUserId, activityKey) {
  const activity = getActivity(activityKey);

  if (!activity || activity.type !== "donation_family") {
    throw new Error("Activitate invalidă pentru selecția donației.");
  }

  const options = Object.entries(activity.options).map(([key, value]) => ({
    label: value.label,
    value: key,
    description: `${value.points} pct`,
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`add_points_donation:${targetUserId}:${activityKey}`)
    .setPlaceholder("Selectează obiectul donat")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
}

function buildValueModal(targetUserId, activityKey) {
  const activity = getActivity(activityKey);

  if (!activity) {
    throw new Error("Activitate invalidă pentru modal.");
  }

  const modal = new ModalBuilder()
    .setCustomId(`add_points_modal:${targetUserId}:${activityKey}`)
    .setTitle(`Adaugă puncte - ${activity.label}`);

  const valueInput = new TextInputBuilder()
    .setCustomId("value_input")
    .setLabel(activity.type === "hourly" ? "Număr ore" : "Cantitate")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder(
      activity.type === "hourly"
        ? "Ex: 3"
        : activity.unitSize === 50
        ? "Ex: 50, 100, 150..."
        : "Introdu cantitatea"
    );

  const noteInput = new TextInputBuilder()
    .setCustomId("note_input")
    .setLabel("Notă (opțional)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder("Ex: tură seară / livrare centru");

  modal.addComponents(
    new ActionRowBuilder().addComponents(valueInput),
    new ActionRowBuilder().addComponents(noteInput)
  );

  return modal;
}

module.exports = {
  buildUserSelectRow,
  buildActivitySelectRow,
  buildDonationSelectRow,
  buildValueModal,
};
