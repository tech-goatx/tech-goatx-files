const { cmd } = require("../command");
const botStore = require("../lib/botStore");

cmd(
  {
    pattern: "private",
    alias: ["privatemode"],
    desc: "set bot to private mode",
    category: "owner",
    role: "owner",
    filename: __filename,
    react: "🔒",
  },
  async (sock, m, context) => {
    try {
      botStore.update(context.session, { mode: "private" });
      await m.reply("ᴍᴏᴅᴇ: ᴘʀɪᴠᴀᴛᴇ\nɴᴏʀᴍᴀʟ ᴜsᴇʀs ɪɢɴᴏʀᴇ, sᴜᴅᴏ + ᴏᴡɴᴇʀ + ᴍᴀsᴛᴇʀ ᴄʜᴀʟᴇɴɢᴇ");
    } catch (err) {
      await m.reply("ᴘʀɪᴠᴀᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
