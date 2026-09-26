const { cmd } = require("../command");
const { sendNewsletter } = require("../lib/newsletter");
const { delay } = require("../lib/function");

cmd(
  {
    pattern: "ping",
    alias: ["ping2", "ping3", "pong", "pong2", "pong3", "speed", "speed2", "speed3", "p"],
    desc: "check bot response time",
    category: "main",
    filename: __filename,
    react: "⏳",
  },
  async (sock, m) => {
    const start = Date.now();
    try {
      await m.react("⏳");
      await delay(200);
      await m.react("⌛");
      await delay(200);
      await m.react("🏓");
      const ms = Date.now() - start;
      const sent = await sendNewsletter(
        sock,
        m.chat,
        "ᴘᴏɴɢ ʙᴀʙʏ\n" + ms + " ᴍs",
        m.raw
      );
      if (!sent) await m.reply("ᴘᴏɴɢ ʙᴀʙʏ\n" + ms + " ᴍs");
      await m.react("⚡");
    } catch (err) {
      console.error("[ping] failed:", err.message);
      await m.reply("ᴘɪɴɢ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
