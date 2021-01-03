const { Telegraf } = require("telegraf");
const Markup = require("telegraf/markup");

const BOT_TOKEN =
  process.env.BOT_TOKEN || "1492189543:AAH-rkODUKiy017M6yKVpyqsqliRMvczgV8";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    `Hello ${ctx.from.first_name}`,
    Markup.inlineKeyboard([
      Markup.callbackButton("click here", "CLICK_HERE"),
      Markup.urlButton("my Channel", "https://t.me/ironyman2"),
    ]).extra()
  );
});

bot.action("CLICK_HERE", ({ editMessageText }) =>
  editMessageText("You did it!")
);

bot.on("text", (ctx) => {
  return ctx.reply(`Hello ${ctx.from.first_name}`);
});

bot.launch();
// bot.startPolling();

console.log("Starting App...");
const PORT = process.env.PORT || 5000;
console.log("PORT: " + PORT);
