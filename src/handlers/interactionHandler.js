async function handleInteraction(interaction) {
  if (!interaction.isButton()) return;

  const { customId } = interaction;

  if (customId === "add_points") {
    await interaction.reply({
      content: "Butonul **Adaugă puncte** va fi configurat în pasul următor.",
      ephemeral: true,
    });
    return;
  }

  if (customId === "remove_points") {
    await interaction.reply({
      content: "Butonul **Scoate puncte** va fi configurat în pasul următor.",
      ephemeral: true,
    });
    return;
  }

  if (customId === "check_points") {
    await interaction.reply({
      content: "Butonul **Verifică puncte** va fi configurat în pasul următor.",
      ephemeral: true,
    });
    return;
  }

  if (customId === "reset_points") {
    await interaction.reply({
      content: "Butonul **Reset puncte** va fi configurat în pasul următor.",
      ephemeral: true,
    });
  }
}

module.exports = { handleInteraction };
