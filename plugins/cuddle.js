const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "cuddle",
    desc: "cuddle gif",
    category: "fun",
    filename: __filename,
    react: "🥰",
    usage: ".cuddle @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "cuddled", "cuddle");
    } catch (err) {
      await m.reply("ᴄᴜᴅᴅʟᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
