const { cmd } = require("../command");

cmd(
  {
    pattern: "del",
    alias: ["delete", "d"],
    desc: "delete a quoted message",
    category: "tools",
    filename: __filename,
    react: "🗑️",
  },
  async (sock, m) => {
    try {
      if (!m.quoted || !m.quoted.fakeObj) {
        await m.reply("ᴍᴇssᴀɢᴇ ʀᴇᴘʟʏ ᴋᴀʀᴏ");
        return;
      }
      await sock.sendMessage(m.chat, { delete: m.quoted.fakeObj.key });
    } catch (err) {
      await m.reply("ᴅᴇʟ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
