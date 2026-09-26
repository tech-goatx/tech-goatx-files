const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "link",
    alias: ["gclink", "invitelink", "grouplink"],
    desc: "get group invite link",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "🔗",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const code = await sock.groupInviteCode(m.chat);
      await m.reply("https://chat.whatsapp.com/" + code);
    } catch (err) {
      await m.reply("ʟɪɴᴋ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
