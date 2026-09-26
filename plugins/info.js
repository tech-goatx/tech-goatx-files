const { cmd } = require("../command");
const { sendNewsletter } = require("../lib/newsletter");
const { getSettings } = require("../lib/getSettings");
const os = require("os");

cmd(
  {
    pattern: "status",
    alias: ["botstatus", "sys"],
    desc: "show system and bot status",
    category: "main",
    filename: __filename,
    react: "📊",
  },
  async (sock, m, context) => {
    try {
      const settings = getSettings();
      const used = process.memoryUsage();
      const rss = (used.rss / 1024 / 1024).toFixed(1);
      const heap = (used.heapUsed / 1024 / 1024).toFixed(1);
      const text =
        (settings.botName || "bot") +
        " sᴛᴀᴛᴜs\n" +
        "ᴍᴏᴅᴇ: " +
        ((context && context.mode) || settings.mode || "public") +
        "\n" +
        "ʀᴀᴍ: " +
        heap +
        " / " +
        rss +
        " ᴍʙ\n" +
        "ᴘʟᴀᴛғᴏʀᴍ: " +
        os.platform() +
        "\n" +
        "ɴᴏᴅᴇ: " +
        process.version;
      await sendNewsletter(sock, m.chat, text, m.raw);
    } catch (err) {
      await m.reply("sᴛᴀᴛᴜs ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
