const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "wink",
    desc: "wink gif",
    category: "fun",
    filename: __filename,
    react: "😉",
    usage: ".wink @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "winked at", "wink");
    } catch (err) {
      await m.reply("ᴡɪɴᴋ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
