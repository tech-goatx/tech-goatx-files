const { cmd } = require("../command");
const { getGroupAdmins } = require("../lib/function");

cmd(
  {
    pattern: "tagadmins",
    alias: ["admins", "staff"],
    desc: "mention group admins",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "👑",
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
      if (!meta) {
        await m.reply("ɢʀᴏᴜᴘ ᴅᴀᴛᴀ ɴᴀʜɪ ᴍɪʟᴀ");
        return;
      }
      const ids = getGroupAdmins(meta.participants || []);
      if (!ids.length) {
        await m.reply("ɴᴏ ᴀᴅᴍɪɴs");
        return;
      }
      let text = String((context && context.text) || "").trim() || "ᴀᴅᴍɪɴs";
      text += "\n\n";
      ids.forEach((id, i) => {
        text += (i + 1) + ". @" + String(id).split("@")[0] + "\n";
      });
      await sock.sendMessage(m.chat, { text, mentions: ids }, { quoted: m.raw });
    } catch (err) {
      await m.reply("ᴛᴀɢᴀᴅᴍɪɴs ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
