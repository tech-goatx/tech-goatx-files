const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "bonk",
    desc: "bonk gif",
    category: "fun",
    filename: __filename,
    react: "🔨",
    usage: ".bonk @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "bonked", "bonk");
    } catch (err) {
      await m.reply("ʙᴏɴᴋ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
