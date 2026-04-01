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
    .setPlaceholder("Alege membrul")
    .setMinValues(1)
    .setMaxValues(1);

  return new ActionRowBuilder().addComponents(userSelect);
}

function buildActivitySelectRow(targetUserId) {
  const activities = getAllActivities();

  const options = Object.entries(activities).map(([key, value]) => {
    let description = "Alege activitatea";

    if (value.type === "fixed") {
      description = ${value.points} pct;
    } else if (value.type === "fixed_with_required_note") {
      description = ${value.points} pct • necesită descriere;
    } else if (value.type === "hourly") {
      description = ${value.pointsPerUnit} pct / oră;
    } else if (value.type === "donation_family") {
      description = "Alegi obiectul și cantitatea";
    } else if (value.type === "delivery_quantity") {
      description = "Alegi tipul și cantitatea";
    }

    return {
      label: value.label,
      value: key,
      description,
    };
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(add_points_activity:${targetUserId})
    .setPlaceholder("Alege activitatea")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
}

function buildDonationSelectRow(targetUserId, activityKey) {
  const activity = getActivity(activityKey);

  if (!activity || activity.type !== "donation_family") {
    throw new Error("Activitate invalidă pentru selecția donației.");
  }

  const options = Object.entries(activity.options).map(([key, value]) => {
    const description =
      value.mode === "quantity"
        ? ${value.unitSize} buc = ${value.pointsPerUnit} pct
        : ${value.points} pct;

    return {
      label: value.label,
      value: key,
      description,
    };
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(add_points_donation:${targetUserId}:${activityKey})
    .setPlaceholder("Selectează obiectul donat")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
}

function buildDeliverySelectRow(targetUserId, activityKey) {
  const activity = getActivity(activityKey);

  if (!activity || activity.type !== "delivery_quantity") {
    throw new Error("Activitate invalidă pentru selecția livrării.");
  }

  const options = Object.entries(activity.options).map(([key, value]) => ({
    label: value.label,
    value: key,
    description: ${value.unitSize} buc = ${value.pointsPerUnit} pct,
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(add_points_delivery:${targetUserId}:${activityKey})
    .setPlaceholder("Selectează tipul livrării")
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
}

function buildValueModal(targetUserId, activityKey, optionKey = null) {
  const activity = getActivity(activityKey);

  if (!activity) {
    throw new Error("Activitate invalidă pentru modal.");
  }

  const modalId = optionKey
    ? add_points_modal:${targetUserId}:${activityKey}:${optionKey}
    : add_points_modal:${targetUserId}:${activityKey};

  const modal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle(Adaugă puncte - ${activity.label});

  let valueLabel = "Cantitate";
  let placeholder = "Introdu valoarea";

  if (activity.type === "hourly") {
    valueLabel = "Număr ore";
    placeholder = "Ex: 3";
  }

  if (activity.type === "delivery_quantity") {
    const selectedOption = activity.options?.[optionKey];

    if (!selectedOption) {
      throw new Error("Tip de livrare invalid pentru modal.");
    }

    valueLabel = Cantitate ${selectedOption.label};
    placeholder =
      selectedOption.unitSize === 50
        ? "Ex: 50, 100, 150..."
        : "Ex: 35, 70, 105...";
  }

  if (activity.type === "donation_family") {
    const selectedOption = activity.options?.[optionKey];

    if (!selectedOption) {
      throw new Error("Obiect de donație invalid pentru modal.");
    }

    if (selectedOption.mode === "quantity") {
      valueLabel = Cantitate ${selectedOption.label};
      placeholder = Multiplu de ${selectedOption.unitSize};
    }
  }

  const valueInput = new TextInputBuilder()
    .setCustomId("value_input")
    .setLabel(valueLabel)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder(placeholder);

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

function buildRequiredNoteModal(targetUserId, activityKey) {
  const activity = getActivity(activityKey);

  if (!activity) {
    throw new Error("Activitate invalidă pentru modal.");
  }

  const modal = new ModalBuilder()
    .setCustomId(add_points_required_note_modal:${targetUserId}:${activityKey})
    .setTitle(Adaugă puncte - ${activity.label});

  const descriptionInput = new TextInputBuilder()
    .setCustomId("required_note_input")
    .setLabel("Ce acțiune a avut loc")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(300)
    .setPlaceholder("Ex: re-stock la magazin, mutare materiale, ajutor spontan la locație");

  modal.addComponents(
    new ActionRowBuilder().addComponents(descriptionInput)
  );

  return modal;
}

module.exports = {
  buildUserSelectRow,
  buildActivitySelectRow,
  buildDonationSelectRow,
  buildDeliverySelectRow,
  buildValueModal,
  buildRequiredNoteModal,
};
