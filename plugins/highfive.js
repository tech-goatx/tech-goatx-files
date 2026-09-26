const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "highfive",
    alias: ["high5"],
    desc: "highfive gif",
    category: "fun",
    filename: __filename,
    react: "🖐️",
    usage: ".highfive @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "high-fived", "highfive");
    } catch (err) {
      await m.reply("ʜɪɢʜғɪᴠᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
