const { cmd } = require("../command");
const { sendNewsletter } = require("../lib/newsletter");
const { runtime } = require("../lib/function");

cmd(
  {
    pattern: "runtime",
    alias: ["uptime"],
    desc: "show bot uptime",
    category: "main",
    filename: __filename,
    react: "⏱️",
  },
  async (sock, m) => {
    try {
      await sendNewsletter(
        sock,
        m.chat,
        "ᴜᴘᴛɪᴍᴇ: " + runtime(process.uptime()),
        m.raw
      );
    } catch (err) {
      await m.reply("ʀᴜɴᴛɪᴍᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
