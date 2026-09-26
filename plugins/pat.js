const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "pat",
    desc: "pat gif",
    category: "fun",
    filename: __filename,
    react: "🫶",
    usage: ".pat @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "patted", "pat");
    } catch (err) {
      await m.reply("ᴘᴀᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
