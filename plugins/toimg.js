const { cmd } = require("../command");

cmd(
  {
    pattern: "toimg",
    alias: ["toimage", "img"],
    desc: "sticker to image",
    category: "tools",
    filename: __filename,
    react: "🖼️",
  },
  async (sock, m) => {
    try {
      let buffer = null;
      if (m.mtype === "stickerMessage") {
        buffer = await m.download();
      } else if (m.quoted && m.quoted.type === "stickerMessage") {
        buffer = await m.quoted.download();
      }
      if (!buffer) {
        await m.reply("sᴛɪᴄᴋᴇʀ ʀᴇᴘʟʏ ᴋᴀʀᴏ");
        return;
      }
      await sock.sendMessage(
        m.chat,
        { image: buffer, caption: "ᴅᴏɴᴇ" },
        { quoted: m.raw }
      );
    } catch (err) {
      await m.reply("ᴛᴏɪᴍɢ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
