const express = require("express");
const discord = require("discord.js");

const { FLAGS } = discord.Intents;

const app = express();

app.get("/", (req, res) => {
  res.send(`h ello`);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("LISTENING");
});

const bot = new discord.Client({
  intents: [
    FLAGS.GUILDS,
    FLAGS.GUILD_MEMBERS,
    FLAGS.GUILD_BANS,
    FLAGS.GUILD_EMOJIS_AND_STICKERS,
    FLAGS.GUILD_INTEGRATIONS,
    FLAGS.GUILD_WEBHOOKS,

    FLAGS.GUILD_INVITES,
    FLAGS.GUILD_VOICE_STATES,
    FLAGS.GUILD_PRESENCES,
    FLAGS.GUILD_MESSAGES,
    FLAGS.GUILD_MESSAGE_REACTIONS,
    FLAGS.GUILD_MESSAGE_TYPING,
    FLAGS.DIRECT_MESSAGES,
    FLAGS.DIRECT_MESSAGE_REACTIONS,
    FLAGS.DIRECT_MESSAGE_TYPING,
  ],
});

bot.on("ready", () => {
  console.log(`loged in ${bot.user.tag}`);
});

bot.on("messageCreate", async (msg) => {
  console.log(`${msg.author.tag}: ${msg.content}`);

  if (msg.author.id === "662201438621138954") msg.reply("dd");
});

bot.login();
