const { cmd } = require("../command");
const { extractTarget, requireGroupAdmin, resolveParticipant } = require("../lib/cmdutil");

cmd(
  {
    pattern: "demote",
    alias: ["removeadmin"],
    desc: "demote group admin",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "⬇️",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const target = extractTarget(m, context.args);
      if (!target) {
        await m.reply("ᴍᴇɴᴛɪᴏɴ ʏᴀ ʀᴇᴘʟʏ ᴋᴀʀᴏ");
        return;
      }
      const victim = resolveParticipant(meta, target, sock);
      await sock.groupParticipantsUpdate(m.chat, [victim], "demote");
      await m.reply("ᴅᴇᴍᴏᴛᴇᴅ");
    } catch (err) {
      await m.reply("ᴅᴇᴍᴏᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
