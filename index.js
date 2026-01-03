// index.js
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GITHUB_SECRET = process.env.GITHUB_SECRET;

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
app.use(express.json()); // parse JSON

// Health check route (optional)
app.get("/", (req, res) => {
  res.send("Render service is running");
});

// GitHub webhook route
app.post("/github-webhook", (req, res) => {
  console.log("GitHub webhook received!");

  const event = req.headers["x-github-event"];
  if (event === "push" && req.body.commits) {
    const commits = req.body.commits.map(c => `- ${c.message}`).join("\n");
    const pusher = req.body.pusher.na
