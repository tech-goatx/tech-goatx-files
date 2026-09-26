const { cmd } = require("../command");
const { decodeJid } = require("../lib/jid");

cmd(
  {
    pattern: "fullpp",
    alias: ["setpp", "setdp", "botdp", "setppbot"],
    desc: "set bot profile picture",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "🖼️",
    usage: ".fullpp (reply to image)",
  },
  async (sock, m) => {
    try {
      let buffer = null;
      if (m.mtype === "imageMessage") buffer = await m.download();
      else if (m.quoted && m.quoted.type === "imageMessage") buffer = await m.quoted.download();
      if (!buffer) {
        await m.reply("ʀᴇᴘʟʏ ᴀɴ ɪᴍᴀɢᴇ");
        return;
      }
      const botJid = decodeJid(sock.user && sock.user.id);
      await sock.updateProfilePicture(botJid, buffer);
      await m.reply("ʙᴏᴛ ᴘᴘ ᴜᴘᴅᴀᴛᴇᴅ");
    } catch (err) {
      await m.reply("ғᴜʟʟᴘᴘ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
