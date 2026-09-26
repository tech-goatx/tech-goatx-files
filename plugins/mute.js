const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "mute",
    alias: ["close", "lock"],
    desc: "mute group (admins only chat)",
    category: "group",
    role: "admin",
    filename: __filename,
    react: "🔇",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      await sock.groupSettingUpdate(m.chat, "announcement");
      await m.reply("ɢʀᴏᴜᴘ ᴍᴜᴛᴇ ʜᴏ ɢᴀʏᴀ, sɪʀғ ᴀᴅᴍɪɴs ʟɪᴋʜᴇɴɢᴇ");
    } catch (err) {
      console.error("[mute] failed:", err.message);
      await m.reply("ᴍᴜᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
