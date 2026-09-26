const { cmd } = require("../command");

cmd(
  {
    pattern: "pick",
    alias: ["choose"],
    desc: "pick a random option",
    category: "fun",
    filename: __filename,
    react: "🎯",
    usage: ".pick a, b, c",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      const opts = text
        .split(/[,|]/)
        .map((item) => item.trim())
        .filter(Boolean);
      if (opts.length < 2) {
        await m.reply("ᴜsᴇ: .pick a, b, c");
        return;
      }
      await m.reply(opts[Math.floor(Math.random() * opts.length)]);
    } catch (err) {
      await m.reply("ᴘɪᴄᴋ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
