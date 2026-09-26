const { cmd } = require("../command");
const { sendNewsletter } = require("../lib/newsletter");
const { delay, runtime } = require("../lib/function");
const { getSettings } = require("../lib/getSettings");

function loadSettings() {
  return getSettings();
}

cmd(
  {
    pattern: "alive",
    alias: ["live"],
    desc: "show bot online status",
    category: "main",
    filename: __filename,
    react: "⏳",
  },
  async (sock, m) => {
    try {
      const settings = loadSettings();
      await m.react("⏳");
      await delay(180);
      await m.react("⌛");
      await delay(180);
      await m.react("⚡");
      const text =
        "ᴏɴʟɪɴᴇ ᴀᴜʀ ᴀᴄᴛɪᴠᴇ ʙᴀʙʏ\n" +
        "ʙᴏᴛ: " +
        (settings.botName || "") +
        "\n" +
        "ᴏᴡɴᴇʀ: " +
        (settings.ownerName || "") +
        "\n" +
        "ᴜᴘᴛɪᴍᴇ: " +
        runtime(process.uptime()) +
        "\n" +
        "ᴠ: " +
        (settings.version || "");
      const sent = await sendNewsletter(sock, m.chat, text, m.raw);
      if (!sent) await m.reply(text);
      await m.react("🤖");
    } catch (err) {
      console.error("[alive] failed:", err.message);
      await m.reply("ᴀʟɪᴠᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
