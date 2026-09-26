const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "unmute",
    alias: ["open", "unlock"],
    desc: "unmute group",
    category: "group",
    role: "admin",
    filename: __filename,
    react: "🔊",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      await sock.groupSettingUpdate(m.chat, "not_announcement");
      await m.reply("ɢʀᴏᴜᴘ ᴜɴᴍᴜᴛᴇ ʜᴏ ɢᴀʏᴀ");
    } catch (err) {
      console.error("[unmute] failed:", err.message);
      await m.reply("ᴜɴᴍᴜᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
