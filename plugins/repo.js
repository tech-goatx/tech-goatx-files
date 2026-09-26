const { cmd } = require("../command");
const { sendNewsletter } = require("../lib/newsletter");
const { getSettings } = require("../lib/getSettings");

cmd(
  {
    pattern: "repo",
    alias: ["script", "sc"],
    desc: "bot info and channel",
    category: "main",
    filename: __filename,
    react: "📦",
  },
  async (sock, m) => {
    try {
      const settings = getSettings();
      const text =
        (settings.botName || "") +
        " v" +
        (settings.version || "") +
        "\n" +
        "ᴄʜᴀɴɴᴇʟ: " +
        (settings.channelLink || "") +
        "\n" +
        "ᴏᴡɴᴇʀ: " +
        (settings.ownerName || "");
      await sendNewsletter(sock, m.chat, text, m.raw);
    } catch (err) {
      await m.reply("ʀᴇᴘᴏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
