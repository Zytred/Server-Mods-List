const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = await client.channels.fetch(CHANNEL_ID);
  channel.send("Bot is online!");
});

client.login(DISCORD_TOKEN);

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Render service is running");
});

// GitHub webhook
app.post("/github-webhook", (req, res) => {
  console.log("GitHub webhook received!");

  const event = req.headers["x-github-event"];
  if (event === "push" && req.body.commits) {
    const commits = req.body.commits.map(c => `- ${c.message}`).join("\n");
    const pusher = req.body.pusher.name;
    const repo = req.body.repository.full_name;

    client.channels.fetch(CHANNEL_ID)
      .then(channel => {
        channel.send(`**${pusher} pushed to ${repo}:**\n${commits}`);
      })
      .catch(console.error);
  } // <-- closes if block

  res.sendStatus(200); // <-- closes app.post
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
