import Telegraf from "telegraf";
import Markup from "telegraf/markup.js"
import fetch from "node-fetch";
import {getAllWords, logging$} from "./semantle.js";

const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(BOT_TOKEN);
const wordsNum = 300;
const simLimit = 40;

bot.start((ctx) => {
    ctx.reply(
        `Hello ${ctx.from.first_name}!
        
Click on the buttun below to test ${wordsNum} words
but only words that more then ${simLimit} similarity.`,
        // Markup.inlineKeyboard([
        //     Markup.callbackButton(`semantle`, "semantle"),
        // ]).extra()
    );
});

bot.action("semantle", async ({editMessageText}) => {
    // let chatId = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`).then(res => res.json())
    //     .then(res => res.result[0].callback_query.message.chat.id);
    // logging$.subscribe(async x => {
    //     await bot.telegram.sendMessage(chatId, x);
    // });
    // let allWords = await getAllWords(wordsNum, simLimit).then(result => {
    //     let text = '';
    //     result.forEach(d => {
    //         text = text.concat(`${d.word}: ${d.similarity}\n`)
    //     })
    //     return text;
    // });
    // logging$.next(allWords);
    // logging$.unsubscribe();
    return editMessageText('allWords');
})

bot.command("/check_today_words_list", async (ctx) => {
    const subscription = logging$.subscribe(x => {
        ctx.reply(x);
    });
    let allWords = await getAllWords(wordsNum, simLimit).then(result => {
        let text = '';
        result.forEach(d => {
            text = text.concat(`${d.word}: ${d.similarity}\n`)
        })
        return text;
    });
    logging$.next(allWords);
    subscription.unsubscribe();
})

bot.launch();

console.log("Starting App...");
const PORT = process.env.PORT || 5000;
console.log("PORT: " + PORT);
