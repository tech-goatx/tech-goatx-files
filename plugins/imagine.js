const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "imagine",
    alias: ["art", "aiart"],
    desc: "generate ai image",
    category: "ai",
    filename: __filename,
    react: "🪄",
    usage: ".imagine a cat in space",
  },
  async (sock, m, context) => {
    try {
      const q = String((context && context.text) || "").trim();
      if (!q) {
        await m.reply("ᴜsᴇ: .imagine <prompt>");
        return;
      }
      await m.reply("ɢᴇɴᴇʀᴀᴛɪɴɢ...");
      const apiUrl =
        "https://api.deline.web.id/ai/txt2img?prompt=" + encodeURIComponent(q);
      const res = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 45000,
      });
      await sock.sendMessage(
        m.chat,
        { image: Buffer.from(res.data), caption: q },
        { quoted: m.raw }
      );
    } catch (err) {
      await m.reply("ɪᴍᴀɢɪɴᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
