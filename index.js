require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { initDatabase } = require("./src/db/initDatabase");
const { sendMainPanel } = require("./src/services/panelService");
const { handleInteraction } = require("./src/handlers/interactionHandler");

const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("clientReady", async () => {
  try {
    console.log(`🤖 Logged in as ${client.user.tag}`);

    await initDatabase();
    await sendMainPanel(client);

    console.log("✅ Bot fully initialized");
  } catch (error) {
    console.error("❌ Startup error:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    await handleInteraction(interaction);
  } catch (error) {
    console.error("❌ Interaction error:", error);

    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "A apărut o eroare la procesarea acțiunii.",
        ephemeral: true,
      });
    }
  }
});

client.login(TOKEN);
