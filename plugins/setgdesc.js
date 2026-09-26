const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "setgdesc",
    alias: ["updategdesc", "gdesc", "setdesc"],
    desc: "change group description",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "📝",
    usage: ".setgdesc new description",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const desc = String((context && context.text) || "").trim();
      if (!desc) {
        await m.reply("ᴜsᴇ: .setgdesc <text>");
        return;
      }
      await sock.groupUpdateDescription(m.chat, desc);
      await m.reply("ᴅᴇsᴄ ᴜᴘᴅᴀᴛᴇᴅ");
    } catch (err) {
      await m.reply("sᴇᴛɢᴅᴇsᴄ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
