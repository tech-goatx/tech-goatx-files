const { cmd } = require("../command");

const LINES = [
  "keep going. small steps still count.",
  "you have survived 100% of your worst days.",
  "do it scared. do it anyway.",
  "progress over perfection.",
  "one more try. that's enough for today.",
  "your future self is watching. make them proud.",
  "rest if you must, but do not quit.",
];

cmd(
  {
    pattern: "motivate",
    alias: ["quote"],
    desc: "send a motivation line",
    category: "fun",
    filename: __filename,
    react: "💪",
  },
  async (sock, m) => {
    try {
      await m.reply(LINES[Math.floor(Math.random() * LINES.length)]);
    } catch (err) {
      await m.reply("ᴍᴏᴛɪᴠᴀᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
