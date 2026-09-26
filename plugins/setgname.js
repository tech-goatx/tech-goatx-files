const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "setgname",
    alias: ["updategname", "gname"],
    desc: "change group name",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "✏️",
    usage: ".setgname new name",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const name = String((context && context.text) || "").trim();
      if (!name) {
        await m.reply("ᴜsᴇ: .setgname <name>");
        return;
      }
      await sock.groupUpdateSubject(m.chat, name);
      await m.reply("ɴᴀᴍᴇ ᴜᴘᴅᴀᴛᴇᴅ");
    } catch (err) {
      await m.reply("sᴇᴛɢɴᴀᴍᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
