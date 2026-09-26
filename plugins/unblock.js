const { cmd } = require("../command");
const { extractTarget } = require("../lib/cmdutil");

cmd(
  {
    pattern: "unblock",
    desc: "unblock a whatsapp user",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "✅",
    usage: ".unblock @user | reply | number",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args);
      if (!target) {
        await m.reply("ᴜsᴇ: .unblock @user ʏᴀ ʀᴇᴘʟʏ");
        return;
      }
      await sock.updateBlockStatus(target, "unblock");
      await m.reply("ᴜɴʙʟᴏᴄᴋᴇᴅ");
    } catch (err) {
      await m.reply("ᴜɴʙʟᴏᴄᴋ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
