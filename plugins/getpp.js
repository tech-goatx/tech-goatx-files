const { cmd } = require("../command");
const { extractTarget } = require("../lib/cmdutil");

cmd(
  {
    pattern: "getpp",
    alias: ["pp", "dp"],
    desc: "get profile picture",
    category: "tools",
    filename: __filename,
    react: "🖼️",
    usage: ".getpp @user | reply",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args) || m.sender;
      const url = await sock.profilePictureUrl(target, "image").catch(() => null);
      if (!url) {
        await m.reply("ɴᴏ ᴘᴘ");
        return;
      }
      await sock.sendMessage(
        m.chat,
        { image: { url }, caption: "@" + String(target).split("@")[0] },
        { quoted: m.raw }
      );
    } catch (err) {
      await m.reply("ɢᴇᴛᴘᴘ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
