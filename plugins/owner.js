const { cmd } = require("../command");
const { sendNewsletter } = require("../lib/newsletter");
const { getSettings } = require("../lib/getSettings");

cmd(
  {
    pattern: "owner",
    alias: ["creator"],
    desc: "show owner info",
    category: "main",
    filename: __filename,
    react: "👑",
  },
  async (sock, m, context) => {
    try {
      const settings = getSettings();
      const sessionPhone =
        (context && context.session && context.session.phoneNumber) || "";
      const text =
        "ᴏᴡɴᴇʀ: " +
        (settings.ownerName || "") +
        "\n" +
        "ɴᴜᴍʙᴇʀ: +" +
        (sessionPhone || settings.ownerNumber || "") +
        "\n" +
        "ʙᴏᴛ: " +
        (settings.botName || "");
      await sendNewsletter(sock, m.chat, text, m.raw);
    } catch (err) {
      await m.reply("ᴏᴡɴᴇʀ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
