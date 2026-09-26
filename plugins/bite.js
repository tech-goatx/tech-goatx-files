const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "bite",
    desc: "bite gif",
    category: "fun",
    filename: __filename,
    react: "😬",
    usage: ".bite @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "bit", "bite");
    } catch (err) {
      await m.reply("ʙɪᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
