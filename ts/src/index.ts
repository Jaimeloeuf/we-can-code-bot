require("dotenv").config();

const Telegraf = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

// Get a list of allowed Group Chats for the bot to run in
// @todo Get the list from DB
const allowedGroupChats: string[] = ["wecancode bot test"];

// Context object received by bot callback functions
interface Ctx {
  from: any;
  callbackQuery: any;
  telegram: any;
  message: string;
  chat: any;
  reply: (arg0: string) => any;
}

// Set the bot's username for used in group chats
bot.telegram.getMe().then((botInfo: any) => {
  console.log("Setting username of bot to: ", botInfo.username);
  bot.options.username = botInfo.username;
});

/**
 * Middleware to ensure message/event is from users and not other bots.
 */
bot.use(async function botChecker(ctx: Ctx, next: Function) {
  try {
    // Ignore if sender is another bot
    if (ctx.from.is_bot) return;

    return next();
  } catch (error) {
    console.error(error);
  }
});

/**
 * Middleware to ensure bot is only running in group chats and only designated ones
 */
bot.use(async function inGroup(ctx: Ctx, next: Function) {
  try {
    if (!(ctx.chat.type === "group" || ctx.chat.type === "supergroup")) {
      return ctx.reply("This bot is only usable in group chats");
    }

    if (allowedGroupChats.indexOf(ctx.chat.title) === -1) {
      const errorMessage: string = `Bot is not allowed in this Group chat: "${ctx.chat.title}"`;
      console.log(errorMessage);
      await ctx.reply(errorMessage); // @todo This causes middleware to run again which errors out because bot alr left chat
      return ctx.telegram.leaveChat(ctx.chat.id);
    }

    return next();
  } catch (error) {
    console.error(error);
  }
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
