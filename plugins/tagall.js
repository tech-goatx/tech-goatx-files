const { cmd } = require("../command");

cmd(
  {
    pattern: "tagall",
    alias: ["all", "mentionall"],
    desc: "mention all group members",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "📢",
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
      const extra = String((context && context.text) || "").trim();
      let text = extra ? extra + "\n\n" : "ᴛᴀɢᴀʟʟ ʙᴀʙʏ\n\n";
      ids.forEach((id, i) => {
        text += (i + 1) + ". @" + String(id).split("@")[0] + "\n";
      });
      await sock.sendMessage(
        m.chat,
        { text, mentions: ids },
        { quoted: m.raw }
      );
    } catch (err) {
      await m.reply("ᴛᴀɢᴀʟʟ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
