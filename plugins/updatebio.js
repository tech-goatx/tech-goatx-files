const { cmd } = require("../command");

cmd(
  {
    pattern: "updatebio",
    alias: ["setbio", "bio"],
    desc: "update bot whatsapp bio",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "📝",
    usage: ".updatebio text",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .updatebio <text>");
        return;
      }
      await sock.updateProfileStatus(text);
      await m.reply("ʙɪᴏ ᴜᴘᴅᴀᴛᴇᴅ");
    } catch (err) {
      await m.reply("ᴜᴘᴅᴀᴛᴇʙɪᴏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
