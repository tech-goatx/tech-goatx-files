const { cmd } = require("../command");

cmd(
  {
    pattern: "hidetag",
    alias: ["htag", "hide"],
    desc: "hidden mention all members",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "👻",
  },
  async (sock, m, context) => {
    try {
      if (!m.isGroup) {
        await m.reply("ʏᴇʜ ɢʀᴏᴜᴘ ᴄᴏᴍᴍᴀɴᴅ ʜᴀɪ");
        return;
      }
      const meta =
        (context && context.groupMetadata) ||
        (await sock.groupMetadata(m.chat).catch(() => null));
      if (!meta || !Array.isArray(meta.participants)) {
        await m.reply("ɢʀᴏᴜᴘ ᴅᴀᴛᴀ ɴᴀʜɪ ᴍɪʟᴀ");
        return;
      }
      const ids = meta.participants
        .map((p) => p.id || p.jid || p.phoneNumber)
        .filter(Boolean);
      const text = String((context && context.text) || "").trim() || "hidetag";
      await sock.sendMessage(
        m.chat,
        { text, mentions: ids },
        { quoted: m.raw }
      );
    } catch (err) {
      await m.reply("ʜɪᴅᴇᴛᴀɢ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
