const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "revoke",
    alias: ["resetlink", "newlink"],
    desc: "reset group invite link",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "🔄",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const code = await sock.groupRevokeInvite(m.chat);
      await m.reply("ɴᴇᴡ ʟɪɴᴋ:\nhttps://chat.whatsapp.com/" + code);
    } catch (err) {
      await m.reply("ʀᴇᴠᴏᴋᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
