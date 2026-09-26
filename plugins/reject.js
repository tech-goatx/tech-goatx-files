const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "reject",
    alias: ["deny"],
    desc: "reject a pending join request by number",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "❌",
    usage: ".reject 1",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const num = parseInt(context.args && context.args[0], 10);
      if (!num || num < 1) {
        await m.reply("ᴜsᴇ: .reject 1");
        return;
      }
      const requests = await sock.groupRequestParticipantsList(m.chat);
      if (!requests || !requests.length) {
        await m.reply("ɴᴏ ᴘᴇɴᴅɪɴɢ ʀᴇǫᴜᴇsᴛs");
        return;
      }
      if (num > requests.length) {
        await m.reply("ᴏɴʟʏ " + requests.length + " ʀᴇǫᴜᴇsᴛs");
        return;
      }
      const id = requests[num - 1].jid || requests[num - 1].id;
      await sock.groupRequestParticipantsUpdate(m.chat, [id], "reject");
      await m.reply("ʀᴇᴊᴇᴄᴛᴇᴅ " + String(id).split("@")[0]);
    } catch (err) {
      await m.reply("ʀᴇᴊᴇᴄᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
