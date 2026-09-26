const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "requests",
    alias: ["joinrequests", "pending"],
    desc: "list pending join requests",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "📋",
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
      let text = "ᴘᴇɴᴅɪɴɢ:\n";
      requests.forEach((item, i) => {
        const id = item.jid || item.id || "";
        text += (i + 1) + ". " + String(id).split("@")[0] + "\n";
      });
      await m.reply(text);
    } catch (err) {
      await m.reply("ʀᴇǫᴜᴇsᴛs ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
