const { cmd } = require("../command");
const { sendNewsletter } = require("../lib/newsletter");

cmd(
  {
    pattern: "jid",
    alias: ["id", "getjid"],
    desc: "show chat and sender jid",
    category: "tools",
    filename: __filename,
    react: "🪪",
  },
  async (sock, m) => {
    try {
      const text =
        "ᴄʜᴀᴛ: " +
        m.chat +
        "\n" +
        "sᴇɴᴅᴇʀ: " +
        m.sender +
        "\n" +
        "ɴᴀᴍᴇ: " +
        (m.pushName || "");
      await sendNewsletter(sock, m.chat, text, m.raw);
    } catch (err) {
      await m.reply("ᴊɪᴅ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
