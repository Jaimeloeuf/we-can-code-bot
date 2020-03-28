require("dotenv").config();

const Telegraf = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

// Context object received by bot callback functions
interface Ctx {
  me: boolean;
  chat: any;
  reply: (arg0: string) => any;
  message: string;
}

/**
 * Middleware to ensure bot is only running in the designated group chat
 */
bot.use((ctx: Ctx, next: Function) => {
  if (!(ctx.chat.type === "group" || ctx.chat.type === "supergroup")) {
    return ctx.reply("Can only use this bot in group chat");
  }

  if (ctx.chat.title !== "wecancode bot test") {
    return ctx.reply("Invalid group");
  }

  return next();
});

// What to do when a new member joins the chat group
bot.on("new_chat_members", (ctx: Ctx) => {
  return ctx.reply("Hello mate");
});

bot.help((ctx: Ctx) => ctx.reply("Here to help!"));

bot.on("text", (ctx: Ctx) => {
  console.log(ctx.message);
  ctx.reply("received");
});

bot.launch();
