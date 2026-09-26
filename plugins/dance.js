const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "dance",
    desc: "dance gif",
    category: "fun",
    filename: __filename,
    react: "💃",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "is dancing", "dance");
    } catch (err) {
      await m.reply("ᴅᴀɴᴄᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
