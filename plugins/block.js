const { cmd } = require("../command");
const { extractTarget } = require("../lib/cmdutil");

cmd(
  {
    pattern: "block",
    desc: "block a whatsapp user",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "🚫",
    usage: ".block @user | reply | number",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args);
      if (!target) {
        await m.reply("ᴜsᴇ: .block @user ʏᴀ ʀᴇᴘʟʏ");
        return;
      }
      await sock.updateBlockStatus(target, "block");
      await m.reply("ʙʟᴏᴄᴋᴇᴅ");
    } catch (err) {
      await m.reply("ʙʟᴏᴄᴋ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
