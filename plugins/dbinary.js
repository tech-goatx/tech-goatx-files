const { cmd } = require("../command");

cmd(
  {
    pattern: "dbinary",
    alias: ["frombin"],
    desc: "binary to text",
    category: "tools",
    filename: __filename,
    react: "1️⃣",
    usage: ".dbinary 01101000 ...",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .dbinary 01101000 ...");
        return;
      }
      const out = text
        .split(/\s+/)
        .filter(Boolean)
        .map((bits) => String.fromCharCode(parseInt(bits, 2)))
        .join("");
      await m.reply(out || "ɪɴᴠᴀʟɪᴅ");
    } catch (err) {
      await m.reply("ᴅʙɪɴᴀʀʏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
