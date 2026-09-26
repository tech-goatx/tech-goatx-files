const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "blush",
    desc: "blush gif",
    category: "fun",
    filename: __filename,
    react: "😊",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "is blushing", "blush");
    } catch (err) {
      await m.reply("ʙʟᴜsʜ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
