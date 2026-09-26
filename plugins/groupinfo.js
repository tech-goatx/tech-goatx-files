const { cmd } = require("../command");
const { getGroupAdmins } = require("../lib/function");

cmd(
  {
    pattern: "groupinfo",
    alias: ["ginfo", "infogroup"],
    desc: "show group info",
    category: "group",
    filename: __filename,
    react: "ℹ️",
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
      const admins = getGroupAdmins(meta.participants || []);
      const text =
        "ɢʀᴏᴜᴘ: " +
        (meta.subject || "") +
        "\n" +
        "ᴍᴇᴍʙᴇʀs: " +
        ((meta.participants && meta.participants.length) || 0) +
        "\n" +
        "ᴀᴅᴍɪɴs: " +
        admins.length +
        "\n" +
        "ɪᴅ: " +
        m.chat;
      await m.reply(text);
    } catch (err) {
      await m.reply("ɢʀᴏᴜᴘɪɴғᴏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
