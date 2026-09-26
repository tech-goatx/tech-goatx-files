const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "slap",
    desc: "slap gif",
    category: "fun",
    filename: __filename,
    react: "👋",
    usage: ".slap @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "slapped", "slap");
    } catch (err) {
      await m.reply("sʟᴀᴘ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
