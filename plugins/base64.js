const { cmd } = require("../command");

cmd(
  {
    pattern: "base64",
    alias: ["b64", "encode"],
    desc: "encode text to base64",
    category: "tools",
    filename: __filename,
    react: "🔐",
    usage: ".base64 text",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .base64 <text>");
        return;
      }
      await m.reply(Buffer.from(text, "utf8").toString("base64"));
    } catch (err) {
      await m.reply("ʙᴀsᴇ64 ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
