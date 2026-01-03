// index.js
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GITHUB_SECRET = process.env.GITHUB_SECRET; // optional for later verification

// ----- Discord bot -----
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = await client.channels.fetch(CHANNEL_ID);
  channel.send("Bot is online!");
});

client.login(DISCORD_TOKEN);

// ----- Express server -----
const app = express();
app.use(express.json()); // parse JSON body

// GitHub webhook route
app.post("/github-webhook", (req, res) => {
  console.log("GitHub webhook received!");

  // Optional: log push info
  const event = req.headers["x-github-event"];
  if (event === "push") {
    const commits = req.body.commits.map(c => `- ${c.message}`).join("\n");
    const pusher = req.body.pusher.name;
    const repo = req.body.repository.full_name;

    client.channels.fetch(CHANNEL_ID)
      .then(channel => {
        channel.send(`**${pusher} pushed to ${repo}:**\n${commits}`);
      })
      .catch(console.error);
  }

  res.sendStatus(200); // always respond 200
});

// Start server on Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
