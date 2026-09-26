const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "gcpp",
    alias: ["setgcpp", "setppgc"],
    desc: "set group profile picture",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "🖼️",
    usage: ".gcpp (reply to image)",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      let buffer = null;
      if (m.mtype === "imageMessage") buffer = await m.download();
      else if (m.quoted && m.quoted.type === "imageMessage") buffer = await m.quoted.download();
      if (!buffer) {
        await m.reply("ʀᴇᴘʟʏ ᴀɴ ɪᴍᴀɢᴇ");
        return;
      }
      await sock.updateProfilePicture(m.chat, buffer);
      await m.reply("ɢʀᴏᴜᴘ ᴘᴘ ᴜᴘᴅᴀᴛᴇᴅ");
    } catch (err) {
      await m.reply("ɢᴄᴘᴘ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
