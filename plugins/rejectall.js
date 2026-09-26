const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "rejectall",
    alias: ["denyall"],
    desc: "reject all pending join requests",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "❌",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const requests = await sock.groupRequestParticipantsList(m.chat);
      if (!requests || !requests.length) {
        await m.reply("ɴᴏ ᴘᴇɴᴅɪɴɢ ʀᴇǫᴜᴇsᴛs");
        return;
      }
      const ids = requests.map((item) => item.jid || item.id).filter(Boolean);
      await sock.groupRequestParticipantsUpdate(m.chat, ids, "reject");
      await m.reply("ʀᴇᴊᴇᴄᴛᴇᴅ: " + ids.length);
    } catch (err) {
      await m.reply("ʀᴇᴊᴇᴄᴛᴀʟʟ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
