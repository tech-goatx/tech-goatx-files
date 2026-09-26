const { cmd } = require("../command");
const botStore = require("../lib/botStore");

cmd(
  {
    pattern: "public",
    alias: ["publicmode"],
    desc: "set bot to public mode",
    category: "owner",
    role: "owner",
    filename: __filename,
    react: "🌍",
  },
  async (sock, m, context) => {
    try {
      botStore.update(context.session, { mode: "public" });
      await m.reply("ᴍᴏᴅᴇ: ᴘᴜʙʟɪᴄ\nɴᴏʀᴍᴀʟ ᴜsᴇʀs ᴏᴡɴᴇʀ ᴄᴍᴅs ᴄʜᴏʀ ᴋᴇ ʙᴀᴀᴋɪ ᴜsᴇ ᴋᴀʀ sᴀᴋᴛᴇ ʜᴀɪɴ");
    } catch (err) {
      await m.reply("ᴘᴜʙʟɪᴄ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
