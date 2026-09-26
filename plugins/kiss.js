const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "kiss",
    desc: "kiss gif",
    category: "fun",
    filename: __filename,
    react: "😘",
    usage: ".kiss @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "kissed", "kiss");
    } catch (err) {
      await m.reply("ᴋɪss ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
