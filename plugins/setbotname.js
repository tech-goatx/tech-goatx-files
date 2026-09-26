const { cmd } = require("../command");

cmd(
  {
    pattern: "setbotname",
    alias: ["botname"],
    desc: "change bot whatsapp name",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "✏️",
    usage: ".setbotname name",
  },
  async (sock, m, context) => {
    try {
      const name = String((context && context.text) || "").trim();
      if (!name) {
        await m.reply("ᴜsᴇ: .setbotname <name>");
        return;
      }
      await sock.updateProfileName(name);
      await m.reply("ɴᴀᴍᴇ ᴜᴘᴅᴀᴛᴇᴅ");
    } catch (err) {
      await m.reply("sᴇᴛʙᴏᴛɴᴀᴍᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
