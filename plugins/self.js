const { cmd } = require("../command");
const botStore = require("../lib/botStore");

cmd(
  {
    pattern: "self",
    alias: ["selfmode"],
    desc: "set bot to self mode",
    category: "owner",
    role: "owner",
    filename: __filename,
    react: "👤",
  },
  async (sock, m, context) => {
    try {
      botStore.update(context.session, { mode: "self" });
      await m.reply("ᴍᴏᴅᴇ: sᴇʟғ\nsɪʀғ ᴏᴡɴᴇʀ + ᴍᴀsᴛᴇʀ ᴄᴍᴅs ᴜsᴇ ᴋᴀʀᴇɴɢᴇ");
    } catch (err) {
      await m.reply("sᴇʟғ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
