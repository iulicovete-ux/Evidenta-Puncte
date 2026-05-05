const { buildMainPanel } = require("../ui/panel");

const CHANNEL_ID = process.env.CHANNEL_ID_EVIDENTA;

async function sendMainPanel(client) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel) {
      console.log("❌ Canalul nu a fost găsit");
      return;
    }

    const messages = await channel.messages.fetch({ limit: 20 });

    const existingPanel = messages.find(
      (msg) =>
        msg.author.id === client.user.id &&
        msg.embeds.length > 0 &&
        msg.embeds[0].title === "📊 Evidență Puncte"
    );

    if (existingPanel) {
      console.log("ℹ️ Panel deja existent, nu se retrimite");
      return;
    }

    const panel = buildMainPanel();

    await channel.send(panel);

    console.log("✅ Panel trimis");
  } catch (err) {
    console.error("❌ Eroare panel:", err);
  }
}

module.exports = { sendMainPanel };
