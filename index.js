import Telegraf from "telegraf";
import {getAllWords, logging$} from "./semantle.js";
import express from "express";
// import {ReplyManager} from "node-telegram-operation-manager";
import Markup from "telegraf/markup.js";
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(BOT_TOKEN);
const wordsNum = process.env.COUNT_WORDS || 1000;
const simLimit = 40;
// const reply = new ReplyManager();

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
    logging$.next(`chacking ${wordsNum} words`)
    const subscription = logging$.subscribe(x => {
        ctx.reply(x);
    });
    let allWords = await getAllWords(wordsNum, simLimit).then(result => {
        if (result.length == 0) return 'not found word with this settings';
        let text = '';
        result.forEach(d => {
            text = text.concat(`${d.word}: ${d.similarity}\n`)
        })
        return text;
    });
    logging$.next(allWords);
    subscription.unsubscribe();
})

bot.command("b", (ctx) => {
    ctx.reply("how many?")
});

bot.launch();

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(PORT, HOST);
console.log("Starting App...");
// console.log(`Running on http://${HOST}:${PORT}`);
console.log("PORT: " + PORT);
