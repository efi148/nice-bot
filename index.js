require("dotenv").config();

const { Telegraf } = require("telegraf");
const Markup = require("telegraf/markup");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
// const express = require("express");
// const expressApp = express();

const bot = new Telegraf(process.env.BOT_TOKEN);
// require("http").createServer(bot.webhookCallback("/secret-path")).listen(3001);
// bot.startWebhook("/secret-path", null, 5000);
// expressApp.use(bot.webhookCallback("/secret-path"));
// bot.telegram.setWebhook("https://server.tld:8443/secret-path");
//
// expressApp.get("/", (req, res) => {
//   res.send(heroku restart"Hello World!");
// });
//
// expressApp.listen(3000, () => {
//   console.log("Example app listening on port 3000!");
// });

// bot.start((ctx) =>
//   ctx.reply(
//     `Welcome ${ctx.message.from.first_name} (@${ctx.message.from.username})`
//   )
// );

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

// Handle sticker or photo update
/* bot.on(["sticker", "photo"], (ctx) => {
  console.log(ctx.message);
  return ctx.reply("Cool!");
}); */

/* // Handle message update
bot.on("message", (ctx) => {
  return ctx.reply("Hello");
}); */

// bot.on("sticker", (ctx) => ctx.reply("👍"));

// bot.hears("hi", (ctx) => ctx.reply("Hey there"));

// bot.command("oldschool", (ctx) => ctx.reply("Hello"));
// bot.command("modern", ({ reply }) => reply("Yo"));
// bot.command("hipster", Telegraf.reply("λ"));

// bot.context.db = {
//   getScores: () => {
//     return 42;
//   },
// };
//  bot.on("text", (ctx) => {
//   console.log(ctx.message);
//   const scores = ctx.db.getScores(ctx.message.from.username);
//   return ctx.reply(`${ctx.message.from.username}: ${scores}`);
// });

/* bot.use((ctx, next) => {
  ctx.state.role = getUserRole(ctx.message);
  return next();
});

bot.on("text", (ctx) => {
  return ctx.reply(`Hello ${ctx.state.role}`);
}); */

/* bot.use(session());
bot.command("reset", (ctx) => {
  ctx.session.counter = 0;
  return ctx.reply("RESETED!");
});
bot.on("text", (ctx) => {
  ctx.session.counter = ctx.session.counter || 0;
  ctx.session.counter++;
  return ctx.reply(`Message counter:${ctx.session.counter}`);
}); */

bot.launch();

console.log("Starting App...");
const PORT = process.env.PORT || 5000;
console.log("PORT: " + PORT + ".");
