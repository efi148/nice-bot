import Telegraf from "telegraf";
import Markup from "telegraf/markup.js"
import {getAllWords} from "./semantle.js";

const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(BOT_TOKEN);
const wordsNum = 30;
const simLimit = 35;
bot.start((ctx) => {
    ctx.reply(
        `Hello ${ctx.from.first_name}`,
        Markup.inlineKeyboard([
            Markup.callbackButton(`semantle: ${wordsNum} words test`, "semantle"),
        ]).extra()
    );
});

bot.action("semantle", async ({editMessageText}) => {
    let allWords = await getAllWords(wordsNum, simLimit).then(result => {
        let text = '';
        result.forEach(d => {
            text = text.concat(`${d.word}: ${d.similarity}\n`)
        })
        return text;
    });
    return editMessageText(allWords);
})
bot.launch();

console.log("Starting App...");
const PORT = process.env.PORT || 5000;
console.log("PORT: " + PORT);
