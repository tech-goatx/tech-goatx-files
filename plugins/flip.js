const { cmd } = require("../command");

cmd(
  {
    pattern: "flip",
    alias: ["coinflip", "coin"],
    desc: "flip a coin",
    category: "fun",
    filename: __filename,
    react: "🪙",
  },
  async (sock, m) => {
    try {
      await m.reply(Math.random() < 0.5 ? "ʜᴇᴀᴅs" : "ᴛᴀɪʟs");
    } catch (err) {
      await m.reply("ғʟɪᴘ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
