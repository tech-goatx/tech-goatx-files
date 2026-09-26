const { cmd } = require("../command");

cmd(
  {
    pattern: "unbase64",
    alias: ["decode", "deb64"],
    desc: "decode base64 to text",
    category: "tools",
    filename: __filename,
    react: "🔓",
    usage: ".unbase64 <base64>",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .unbase64 <base64>");
        return;
      }
      await m.reply(Buffer.from(text, "base64").toString("utf8"));
    } catch (err) {
      await m.reply("ᴜɴʙᴀsᴇ64 ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
