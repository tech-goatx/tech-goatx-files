const { getSettings } = require("./getSettings");

function loadSettings() {
  return getSettings();
}

function initTelegram(sessions, botData, saveBotData, BotSession, settings) {
  const cfg = settings || loadSettings();
  const token = cfg.telegramToken || process.env.TELEGRAM_TOKEN || "";
  const chatId = cfg.telegramChatId || process.env.TELEGRAM_CHAT_ID || "";
  if (!token) {
    console.log("[tg] token missing, skip telegram bot");
    return null;
  }

  let TelegramBot;
  try {
    TelegramBot = require("node-telegram-bot-api");
  } catch (err) {
    console.error("[tg] node-telegram-bot-api missing:", err.message);
    return null;
  }

  let bot;
  try {
    bot = new TelegramBot(token, { polling: true });
  } catch (err) {
    console.error("[tg] start failed:", err.message);
    return null;
  }

  function notify(text) {
    if (!chatId) return;
    bot.sendMessage(chatId, String(text)).catch((err) => {
      console.error("[tg] notify failed:", err.message);
    });
  }

  bot.onText(/\/start/, (msg) => {
    bot
      .sendMessage(
        msg.chat.id,
        (cfg.botName || "") + " ᴏɴʟɪɴᴇ ʜᴀɪ\n/status\n/sessions\n/pair <number>"
      )
      .catch(() => {});
  });

  bot.onText(/\/status/, (msg) => {
    const count = sessions ? sessions.size : 0;
    bot
      .sendMessage(
        msg.chat.id,
        "sᴇssɪᴏɴs: " + count + "/" + (cfg.sessionLimit || 0)
      )
      .catch(() => {});
  });

  bot.onText(/\/sessions/, (msg) => {
    const lines = [];
    if (sessions) {
      for (const s of sessions.values()) {
        lines.push(
          (s.phoneNumber || s.userId) + " " + (s.isConnected ? "online" : "offline")
        );
      }
    }
    bot
      .sendMessage(msg.chat.id, lines.length ? lines.join("\n") : "ɴᴏ sᴇssɪᴏɴs")
      .catch(() => {});
  });

  bot.onText(/\/pair\s+(\d+)/, async (msg, match) => {
    try {
      const number = String(match[1] || "").replace(/[^0-9]/g, "");
      let session = null;
      for (const item of sessions.values()) {
        if (item.phoneNumber === number) {
          session = item;
          break;
        }
      }
      if (session && session.isConnected) {
        return bot.sendMessage(msg.chat.id, "ᴀʟʀᴇᴀᴅʏ ᴄᴏɴɴᴇᴄᴛᴇᴅ: " + number);
      }
      if (!session) {
        if (sessions.size >= Number(cfg.sessionLimit || 0)) {
          return bot.sendMessage(msg.chat.id, "sᴇssɪᴏɴ ʟɪᴍɪᴛ ʀᴇᴀᴄʜᴇᴅ");
        }
        session = new BotSession(number, number, msg.chat.id);
        sessions.set(session.userId, session);
      } else {
        session.tgChatId = msg.chat.id;
      }
      if (!session.isInitializing && !session.pairingCode) {
        await session.initialize();
      }
      bot
        .sendMessage(
          msg.chat.id,
          "ᴘᴀɪʀ ᴄᴏᴅᴇ: " + (session.pairingCode || "wait")
        )
        .catch(() => {});
    } catch (err) {
      bot.sendMessage(msg.chat.id, "ᴇʀʀᴏʀ: " + err.message).catch(() => {});
    }
  });

  let pollErrors = 0;
  bot.on("polling_error", (err) => {
    pollErrors += 1;
    if (pollErrors <= 2) {
      console.error("[tg] polling:", err.message);
    }
    if (pollErrors === 3) {
      console.log("[tg] polling stopped after conflicts");
      try {
        bot.stopPolling();
      } catch (e) {}
    }
  });

  return { bot, notify, chatId, saveBotData, botData };
}

module.exports = {
  initTelegram,
};
