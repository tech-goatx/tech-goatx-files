const { cmd } = require("../command");
const { sendReactGif } = require("../lib/reactGif");

cmd(
  {
    pattern: "poke",
    desc: "poke gif",
    category: "fun",
    filename: __filename,
    react: "👉",
    usage: ".poke @user",
  },
  async (sock, m, context) => {
    try {
      await sendReactGif(sock, m, context, "poked", "poke");
    } catch (err) {
      await m.reply("ᴘᴏᴋᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
