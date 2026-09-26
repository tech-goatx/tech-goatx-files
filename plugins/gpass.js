const { cmd } = require("../command");
const crypto = require("crypto");

cmd(
  {
    pattern: "gpass",
    alias: ["genpass", "password"],
    desc: "generate a random password",
    category: "tools",
    filename: __filename,
    react: "🔑",
    usage: ".gpass [length]",
  },
  async (sock, m, context) => {
    try {
      let len = parseInt(context.args && context.args[0], 10);
      if (!len || len < 6) len = 12;
      if (len > 64) len = 64;
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
      let out = "";
      const bytes = crypto.randomBytes(len);
      for (let i = 0; i < len; i++) {
        out += chars[bytes[i] % chars.length];
      }
      await m.reply(out);
    } catch (err) {
      await m.reply("ɢᴘᴀss ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
