const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "hug",
    desc: "hug gif",
    category: "fun",
    filename: __filename,
    react: "🤗",
    usage: ".hug @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "hugged", "hug");
    } catch (err) {
      await m.reply("ʜᴜɢ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
