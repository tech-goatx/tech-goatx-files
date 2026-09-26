const { cmd } = require("../command");

cmd(
  {
    pattern: "calc",
    alias: ["calculate", "math"],
    desc: "simple calculator",
    category: "tools",
    filename: __filename,
    react: "🧮",
    usage: ".calc 2+2*3",
  },
  async (sock, m, context) => {
    try {
      const expr = String((context && context.text) || "").replace(/\s+/g, "");
      if (!expr || !/^[0-9+\-*/().%^]+$/.test(expr)) {
        await m.reply("ᴜsᴇ: .calc 2+2*3");
        return;
      }
      const safe = expr.replace(/\^/g, "**");
      const result = Function('"use strict"; return (' + safe + ")")();
      if (typeof result !== "number" || !isFinite(result)) {
        await m.reply("ɪɴᴠᴀʟɪᴅ");
        return;
      }
      await m.reply(String(result));
    } catch (err) {
      await m.reply("ᴄᴀʟᴄ ғᴀɪʟᴇᴅ");
    }
  }
);
