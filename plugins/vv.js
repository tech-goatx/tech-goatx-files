const { cmd } = require("../command");

cmd(
  {
    pattern: "vv",
    alias: ["viewonce", "readvo"],
    desc: "open view once media",
    category: "tools",
    filename: __filename,
    react: "👁️",
  },
  async (sock, m) => {
    try {
      if (!m.quoted || !m.quoted.message) {
        await m.reply("ᴠɪᴇᴡ ᴏɴᴄᴇ ᴍᴇssᴀɢᴇ ʀᴇᴘʟʏ ᴋᴀʀᴏ");
        return;
      }
      const buffer = await m.quoted.download();
      if (!buffer) {
        await m.reply("ᴍᴇᴅɪᴀ ɴᴀʜɪ ᴍɪʟɪ");
        return;
      }
      const qtype = m.quoted.type || "";
      if (qtype.includes("image")) {
        await sock.sendMessage(m.chat, { image: buffer }, { quoted: m.raw });
      } else if (qtype.includes("video")) {
        await sock.sendMessage(m.chat, { video: buffer }, { quoted: m.raw });
      } else {
        await sock.sendMessage(m.chat, { image: buffer }, { quoted: m.raw });
      }
    } catch (err) {
      await m.reply("ᴠᴠ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
