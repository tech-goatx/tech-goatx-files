const { cmd } = require("../command");

cmd(
  {
    pattern: "join",
    alias: ["joingc"],
    desc: "join group via invite link",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "➕",
    usage: ".join https://chat.whatsapp.com/xxxx",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || m.body || "");
      const match = text.match(/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/);
      if (!match) {
        await m.reply("ᴜsᴇ: .join <group link>");
        return;
      }
      await sock.groupAcceptInvite(match[1]);
      await m.reply("ᴊᴏɪɴᴇᴅ");
    } catch (err) {
      await m.reply("ᴊᴏɪɴ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
