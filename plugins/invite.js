const { cmd } = require("../command");
const { extractTarget, requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "invite",
    alias: ["inv"],
    desc: "invite a user via group code",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "📩",
    usage: ".invite @user | number",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const target = extractTarget(m, context.args);
      if (!target) {
        await m.reply("ᴜsᴇ: .invite @user ʏᴀ ɴᴜᴍʙᴇʀ");
        return;
      }
      const code = await sock.groupInviteCode(m.chat);
      const link = "https://chat.whatsapp.com/" + code;
      try {
        await sock.sendMessage(target, { text: "ɢʀᴏᴜᴘ ɪɴᴠɪᴛᴇ:\n" + link });
        await m.reply("ɪɴᴠɪᴛᴇ sᴇɴᴛ");
      } catch (err) {
        await m.reply(link);
      }
    } catch (err) {
      await m.reply("ɪɴᴠɪᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
