const { buildMainPanel } = require("../ui/panel");

const CHANNEL_ID = process.env.CHANNEL_ID_EVIDENTA;

async function sendMainPanel(client) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel) {
      console.log("❌ Canalul nu a fost găsit");
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
