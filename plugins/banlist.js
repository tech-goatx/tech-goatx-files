const { cmd } = require("../command");
const botStore = require("../lib/botStore");
const { digitsOf } = require("../lib/jid");

cmd(
  {
    pattern: "banlist",
    alias: ["banned"],
    desc: "list banned users",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "📋",
  },
  async (sock, m, context) => {
    try {
      const data = botStore.load(context.session);
      const list = data.bannedJids || [];
      if (!list.length) {
        await m.reply("ɴᴏ ʙᴀɴɴᴇᴅ ᴜsᴇʀs");
        return;
      }
      let text = "ʙᴀɴɴᴇᴅ:\n";
      list.forEach((id, i) => {
        text += (i + 1) + ". " + (digitsOf(id) || id) + "\n";
      });
      await m.reply(text);
    } catch (err) {
      await m.reply("ʙᴀɴʟɪsᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
