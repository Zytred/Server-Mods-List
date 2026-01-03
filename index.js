// index.js
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Discord bot ready
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    await channel.send("Bot is online!");
  } catch (err) {
    console.error("Failed to send online message:", err);
  }
});

client.login(DISCORD_TOKEN);

// Express server
const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("Render service is running"));

// GitHub webhook
app.post("/github-webhook", async (req, res) => {
  console.log("Webhook hit!");
  console.log("Event:", req.headers["x-github-event"]);
  console.log("Body keys:", Object.keys(req.body));

  const event = req.headers["x-github-event"];
  if (event === "push" && req.body.commits) {
    const commits = req.body.commits.map(c => `- ${c.message}`).join("\n");
    const pusher = req.body.pusher.name;
    const repo = req.body.repository.full_name;

    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      await channel.send(`**${pusher} pushed to ${repo}:**\n${commits}`);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  res.sendStatus(200); // Always respond
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
