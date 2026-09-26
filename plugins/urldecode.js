const { cmd } = require("../command");

cmd(
  {
    pattern: "urldecode",
    alias: ["decurl"],
    desc: "url-decode text",
    category: "tools",
    filename: __filename,
    react: "🔗",
    usage: ".urldecode text",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .urldecode <text>");
        return;
      }
      await m.reply(decodeURIComponent(text));
    } catch (err) {
      await m.reply("ᴜʀʟᴅᴇᴄᴏᴅᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
