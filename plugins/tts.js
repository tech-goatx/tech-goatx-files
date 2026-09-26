const { cmd } = require("../command");

cmd(
  {
    pattern: "tts",
    alias: ["sayvoice", "speak"],
    desc: "text to speech",
    category: "media",
    filename: __filename,
    react: "🔊",
    usage: ".tts hello",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .tts <text>");
        return;
      }
      const clip = text.slice(0, 200);
      const url =
        "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" +
        encodeURIComponent(clip);
      await sock.sendMessage(
        m.chat,
        { audio: { url }, mimetype: "audio/mpeg", ptt: false },
        { quoted: m.raw }
      );
    } catch (err) {
      await m.reply("ᴛᴛs ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
