const { cmd } = require("../command");
const { digitsOf } = require("../lib/jid");

cmd(
  {
    pattern: "blocklist",
    alias: ["blocked"],
    desc: "list blocked users",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "🚫",
  },
  async (sock, m) => {
    try {
      const list = await sock.fetchBlocklist();
      if (!list || !list.length) {
        await m.reply("ɴᴏ ʙʟᴏᴄᴋᴇᴅ ᴜsᴇʀs");
        return;
      }
      let text = "ʙʟᴏᴄᴋᴇᴅ:\n";
      list.forEach((id, i) => {
        text += (i + 1) + ". " + (digitsOf(id) || id) + "\n";
      });
      await m.reply(text);
    } catch (err) {
      await m.reply("ʙʟᴏᴄᴋʟɪsᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
