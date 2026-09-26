const { cmd } = require("../command");

cmd(
  {
    pattern: "repeat",
    alias: ["say", "echo"],
    desc: "repeat text",
    category: "fun",
    filename: __filename,
    react: "🔁",
    usage: ".repeat text",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .repeat <text>");
        return;
      }
      await m.reply(text.slice(0, 1000));
    } catch (err) {
      await m.reply("ʀᴇᴘᴇᴀᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
