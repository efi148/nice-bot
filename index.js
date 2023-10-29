import Telegraf from "telegraf";
import session from "telegraf/session.js"
import Stage from "telegraf/stage.js";
import WizardScene from "telegraf/scenes/wizard/index.js"
import { getAllWords, logging$ } from "./semantle.js";
import express from "express";
import Markup from "telegraf/markup.js";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
// import {ReplyManager} from "node-telegram-operation-manager";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOT_TOKEN = process.env.BOT_TOKEN;

let wordListConfig = {
    wordsNum: process.env.COUNT_WORDS || 100,
    simMinLimit: 10,
    simMaxLimit: 90,
    isDistanceShown: true
}

const semantleWizard = new WizardScene(
    'semantle-wizard',
    ctx => {
        ctx.wizard.state.data = { ...wordListConfig };
        ctx.reply(`How many words do you want to check?
(1-10000,)
[defauld ${wordListConfig.wordsNum}, recommended 1500]`);
        return ctx.wizard.next();
    },
    ctx => {
        if (/^(10000|[1-9][0-9]?[0-9]?[0-9]?)$/gm.test(ctx.message.text)) {
            ctx.wizard.state.data.wordsNum = ctx.message.text;
            ctx.reply(`Great! your choose is ${ctx.wizard.state.data.wordsNum}.\nEnter the minimum limit of similarity:
(1-99)
[defauld ${wordListConfig.simMinLimit}, recommended 40]`);
            return ctx.wizard.next();
        } else {
            ctx.reply('try again! just numbers between 1-10000 allowed');
        }

    },
    async ctx => {
        if (/^([1-9][0-9]?)$/gm.test(ctx.message.text)) {
            ctx.wizard.state.data.simMinLimit = ctx.message.text;
            ctx.reply(`Great! your choose is ${ctx.wizard.state.data.simMinLimit}.\nEnter the maximum limit of similarity:
(${parseInt(ctx.wizard.state.data.simMinLimit) + 1}-100)
[defauld ${wordListConfig.simMaxLimit}, recommended 60]`);
            return ctx.wizard.next();
        } else {
            ctx.reply('try again! just numbers between 1-99 allowed');
        }
    },
    async ctx => {
        if (/^(100|[1-9][0-9]?)$/gm.test(ctx.message.text) && parseInt(ctx.message.text) > ctx.wizard.state.data.simMinLimit) {
            ctx.wizard.state.data.simMaxLimit = ctx.message.text;
            ctx.reply(`Great! your choose is ${ctx.wizard.state.data.simMaxLimit}.\ndo you wand to show the distance?
('y' for yes, for no send random char)
[default: no]`);
            return ctx.wizard.next();
        } else {
            ctx.reply(`try again! just numbers between ${parseInt(ctx.wizard.state.data.simMinLimit) + 1}-100 allowed`);
        }
    },
    async ctx => {
        ctx.wizard.state.data.isDistanceShown = (/^([y]|[Y])$/.test(ctx.message.text));
        await ctx.reply(`Great!`);

        const userConfig = ctx.wizard.state.data;
        await ctx.reply(`Your choose is:
            
words number: ${userConfig.wordsNum}
minimum similarity: ${userConfig.simMinLimit}
maximum similarity: ${userConfig.simMaxLimit}
range: ${userConfig.simMaxLimit - userConfig.simMinLimit}
show distance? ${userConfig.isDistanceShown ? 'Yes' : 'No'}
`);
        const subscription = logging$.subscribe(x => {
            ctx.reply(x);
        });
        logging$.next(`checking ${userConfig.wordsNum} words`);
        let allWords = await getAllWords(userConfig.wordsNum, userConfig.simMinLimit, userConfig.simMaxLimit).then(result => {
            if (!result.length) return '- Not found words with this settings -';
            let text = '';
            if (userConfig.isDistanceShown &&
                result.filter(word => word.distance !== -1).length &&
                result.filter(word => word.distance === -1).length) {
                let inRange = '';
                result.filter(word => word.distance !== -1).forEach(word => {
                    inRange = inRange.concat(`${word.word}: ${word.similarity} (${word.distance})\n`)
                });
                let notInRange = '';
                result.filter(word => word.distance === -1).forEach(word => {
                    notInRange = notInRange.concat(`${word.word}: ${word.similarity}\n`)
                });
                text = `words in top 1000:\n${inRange}\n\nwords that far away:\n${notInRange}`;
            } else {
                result.forEach(word => {
                    text = text.concat(`${word.word}: ${word.similarity}\n`)
                });
            }

            return `Found ${result.length} words:\n- - - - - - - - -\n\n` + text;
        });
        logging$.next(allWords);
        await subscription.unsubscribe();
        return ctx.scene.leave();
    }
);

const stage = new Stage([semantleWizard]);

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());

// const reply = new ReplyManager();

bot.start((ctx) => {
    ctx.reply(
        `Hello ${ctx.from.first_name}!
        
Click on the buttun below to test ${wordListConfig.wordsNum} words
but only words that more then ${wordListConfig.simMinLimit} similarity and less then ${wordListConfig.simMaxLimit}.`,
        Markup.inlineKeyboard([
            Markup.callbackButton(`semantle`, "semantle"),
        ]).extra()
    );
});

bot.action("semantle", async ({ editMessageText }) => {
    // let chatId = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`).then(res => res.json())
    //     .then(res => res.result[0].callback_query.message.chat.id);
    // logging$.subscribe(async x => {
    //     await bot.telegram.sendMessage(chatId, x);
    // });
    // let allWords = await getAllWords(wordListConfig.wordsNum, simLimit).then(result => {
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
    logging$.next(`chacking ${wordListConfig.wordsNum} words`);
    let allWords = await getAllWords(wordListConfig.wordsNum, wordListConfig.simMinLimit, wordListConfig.simMaxLimit).then(result => {
        if (result.length === 0) return 'not found word with this settings';
        let text = '';
        result.forEach(d => {
            text = text.concat(`${d.word}: ${d.similarity}\n`)
        })
        return `Found ${result.length} words:\n\n` + text;
    }).catch(err => {
        console.log(err);
    });
    await logging$.next(allWords);
    await subscription.unsubscribe();
})

bot.command("check_words_custom", (ctx) => {
    ctx.scene.enter('semantle-wizard');
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
console.log("PORT: " + PORT);
