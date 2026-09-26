const { cmd } = require("../command");

cmd(
  {
    pattern: "urlencode",
    alias: ["encurl"],
    desc: "url-encode text",
    category: "tools",
    filename: __filename,
    react: "🔗",
    usage: ".urlencode text",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .urlencode <text>");
        return;
      }
      await m.reply(encodeURIComponent(text));
    } catch (err) {
      await m.reply("ᴜʀʟᴇɴᴄᴏᴅᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
