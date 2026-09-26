const { cmd } = require("../command");

cmd(
  {
    pattern: "sticker",
    alias: ["s", "stiker"],
    desc: "image/video to sticker",
    category: "tools",
    filename: __filename,
    react: "🎨",
  },
  async (sock, m) => {
    try {
      let buffer = null;
      const type = m.mtype || "";
      if (type === "imageMessage" || type === "videoMessage") {
        buffer = await m.download();
      } else if (m.quoted && (m.quoted.type === "imageMessage" || m.quoted.type === "videoMessage")) {
        buffer = await m.quoted.download();
      }
      if (!buffer) {
        await m.reply("ɪᴍᴀɢᴇ/ᴠɪᴅᴇᴏ ʙʜᴇᴊᴏ ʏᴀ ʀᴇᴘʟʏ ᴋᴀʀᴏ");
        return;
      }
      await sock.sendMessage(
        m.chat,
        {
          sticker: buffer,
        },
        { quoted: m.raw }
      );
    } catch (err) {
      await m.reply("sᴛɪᴄᴋᴇʀ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
