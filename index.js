// require("dotenv").config();

const { Telegraf } = require("telegraf");
const Markup = require("telegraf/markup");
// const Stage = require("telegraf/stage");
// const session = require("telegraf/session");
// const WizardScene = require("telegraf/scenes/wizard");

const BOT_TOKEN = "1492189543:AAH-rkODUKiy017M6yKVpyqsqliRMvczgV8";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    `Hello ${ctx.from.first_name}, would you like to know the love compatibility?`,
    Markup.inlineKeyboard([
      Markup.callbackButton("click here", "CLICK_HERE"),
      Markup.callbackButton("location", "LOCATION"),
      Markup.urlButton("my Channel", "https://t.me/ironyman2"),
    ]).extra()
  );
});

bot.action("CLICK_HERE", ({ editMessageText }) =>
  editMessageText("You did it!")
);

bot.action("LOCATION", ({ replyWithLocation }) =>
  replyWithLocation(31.75498, 35.0397)
);

bot.help((ctx) => ctx.reply("Send me a sticker"));

bot.on("text", (ctx) => {
  return ctx.reply(`Hello ${ctx.from.first_name}`);
});

bot.launch();

console.log("Starting App...");
const PORT = process.env.PORT || 5000;
console.log("PORT: " + PORT + ".");
