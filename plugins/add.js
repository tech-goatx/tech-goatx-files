const { cmd } = require("../command");
const { extractTarget, requireGroupAdmin, toUserJid } = require("../lib/cmdutil");

cmd(
  {
    pattern: "add",
    alias: ["addmember", "adduser"],
    desc: "add a user to group",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "➕",
    usage: ".add number | @user",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const target = extractTarget(m, context.args) || toUserJid(context.args && context.args[0]);
      if (!target) {
        await m.reply("ᴜsᴇ: .add 923xxxxxxxxx ʏᴀ @user");
        return;
      }
      await sock.groupParticipantsUpdate(m.chat, [target], "add");
      await m.reply("ᴀᴅᴅᴇᴅ");
    } catch (err) {
      await m.reply("ᴀᴅᴅ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
