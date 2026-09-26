const { cmd } = require("../command");
const { extractTarget } = require("../lib/cmdutil");

cmd(
  {
    pattern: "ship",
    alias: ["love", "match"],
    desc: "ship two users",
    category: "fun",
    filename: __filename,
    react: "❤️",
    usage: ".ship @user",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args);
      if (!target) {
        await m.reply("ᴜsᴇ: .ship @user");
        return;
      }
      const pct = Math.floor(Math.random() * 101);
      await m.reply(
        "@" +
          String(m.sender).split("@")[0] +
          " ❤️ @" +
          String(target).split("@")[0] +
          "\n" +
          pct +
          "%",
        { mentions: [m.sender, target] }
      );
    } catch (err) {
      await m.reply("sʜɪᴘ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
