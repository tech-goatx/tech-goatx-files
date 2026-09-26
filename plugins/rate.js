const { cmd } = require("../command");
const { extractTarget } = require("../lib/cmdutil");

cmd(
  {
    pattern: "rate",
    desc: "rate a user 0-100",
    category: "fun",
    filename: __filename,
    react: "⭐",
    usage: ".rate @user",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args) || m.sender;
      const n = Math.floor(Math.random() * 101);
      await m.reply("@" + String(target).split("@")[0] + " ⭐ " + n + "/100", {
        mentions: [target],
      });
    } catch (err) {
      await m.reply("ʀᴀᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
