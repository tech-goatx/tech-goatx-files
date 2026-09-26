const { cmd } = require("../command");

cmd(
  {
    pattern: "binary",
    alias: ["tobin"],
    desc: "text to binary",
    category: "tools",
    filename: __filename,
    react: "0️⃣",
    usage: ".binary text",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .binary <text>");
        return;
      }
      const out = text
        .split("")
        .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, "0"))
        .join(" ");
      await m.reply(out);
    } catch (err) {
      await m.reply("ʙɪɴᴀʀʏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
