const { cmd } = require("../command");

cmd(
  {
    pattern: "roll",
    alias: ["dice"],
    desc: "roll a dice",
    category: "fun",
    filename: __filename,
    react: "🎲",
    usage: ".roll [sides]",
  },
  async (sock, m, context) => {
    try {
      let sides = parseInt(context.args && context.args[0], 10);
      if (!sides || sides < 2) sides = 6;
      if (sides > 1000) sides = 1000;
      const n = 1 + Math.floor(Math.random() * sides);
      await m.reply("🎲 " + n + " / " + sides);
    } catch (err) {
      await m.reply("ʀᴏʟʟ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
