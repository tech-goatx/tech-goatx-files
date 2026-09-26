const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "wave",
    desc: "wave gif",
    category: "fun",
    filename: __filename,
    react: "👋",
    usage: ".wave @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "waved at", "wave");
    } catch (err) {
      await m.reply("ᴡᴀᴠᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
