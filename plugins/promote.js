const { cmd } = require("../command");
const { extractTarget, requireGroupAdmin, resolveParticipant } = require("../lib/cmdutil");

cmd(
  {
    pattern: "promote",
    alias: ["makeadmin"],
    desc: "promote member to admin",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "⬆️",
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
      await sock.groupParticipantsUpdate(m.chat, [victim], "promote");
      await m.reply("ᴘʀᴏᴍᴏᴛᴇᴅ");
    } catch (err) {
      await m.reply("ᴘʀᴏᴍᴏᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
