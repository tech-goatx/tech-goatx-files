const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "cry",
    desc: "cry gif",
    category: "fun",
    filename: __filename,
    react: "😢",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "is crying", "cry");
    } catch (err) {
      await m.reply("ᴄʀʏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
