const { cmd } = require("../command");

cmd(
  {
    pattern: "date",
    alias: ["time", "now"],
    desc: "show current date and time",
    category: "tools",
    filename: __filename,
    react: "📅",
  },
  async (sock, m) => {
    try {
      const now = new Date();
      await m.reply(now.toUTCString() + "\n" + now.toString());
    } catch (err) {
      await m.reply("ᴅᴀᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
