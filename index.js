require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const { Pool } = require("pg");

// ===== ENV =====
const TOKEN = process.env.TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const CHANNEL_ID = process.env.CHANNEL_ID_EVIDENTA;

// ===== DISCORD CLIENT =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ===== DATABASE =====
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ===== INIT DATABASE =====
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT UNIQUE NOT NULL,
        username TEXT,
        display_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS point_entries (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        discord_user_id TEXT NOT NULL,
        activity_key TEXT NOT NULL,
        activity_label TEXT NOT NULL,
        calculation_type TEXT NOT NULL,
        hours INTEGER,
        quantity INTEGER,
        points_awarded INTEGER NOT NULL,
        added_by_discord_user_id TEXT NOT NULL,
        note TEXT,
        is_voided BOOLEAN DEFAULT FALSE,
        void_reason TEXT,
        voided_by_discord_user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        voided_at TIMESTAMP
      );
    `);

    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ Database init error:", err);
  }
}

// ===== CREATE PANEL =====
async function createPanel() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel) {
      console.log("❌ Canalul nu a fost găsit");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("📊 Evidență Puncte")
      .setDescription(
        "Folosește butoanele de mai jos pentru a gestiona punctele membrilor."
      )
      .setColor(0x00ae86);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("add_points")
        .setLabel("Adaugă puncte")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("remove_points")
        .setLabel("Scoate puncte")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("check_points")
        .setLabel("Verifică puncte")
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({
      embeds: [embed],
      components: [row],
    });

    console.log("✅ Panel trimis");
  } catch (err) {
    console.error("❌ Eroare panel:", err);
  }
}

// ===== EVENTS =====
client.once("clientReady", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  await initDatabase();
  await createPanel();
});

// ===== LOGIN =====
client.login(TOKEN);
