const { cmd } = require("../command");

cmd(
  {
    pattern: "leave",
    alias: ["left", "outgc"],
    desc: "bot leaves the group",
    category: "group",
    filename: __filename,
    role: "owner",
    react: "👋",
  },
  async (sock, m) => {
    try {
      if (!m.isGroup) {
        await m.reply("ʏᴇʜ ɢʀᴏᴜᴘ ᴄᴏᴍᴍᴀɴᴅ ʜᴀɪ");
        return;
      }
      await m.reply("ʟᴇᴀᴠɪɴɢ");
      await sock.groupLeave(m.chat);
    } catch (err) {
      await m.reply("ʟᴇᴀᴠᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
