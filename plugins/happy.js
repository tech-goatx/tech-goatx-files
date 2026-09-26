const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "happy",
    alias: ["smile"],
    desc: "happy gif",
    category: "fun",
    filename: __filename,
    react: "😄",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "is happy", "happy");
    } catch (err) {
      await m.reply("ʜᴀᴘᴘʏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
