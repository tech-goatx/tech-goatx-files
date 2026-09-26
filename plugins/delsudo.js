const { cmd } = require("../command");
const botStore = require("../lib/botStore");
const { extractTarget, toUserJid, sameJid, formatNumberLine } = require("../lib/cmdutil");

cmd(
  {
    pattern: "delsudo",
    alias: ["remsudo", "removesudo"],
    desc: "remove a sudo user",
    category: "owner",
    role: "owner",
    filename: __filename,
    react: "🗑️",
    usage: ".delsudo @user | reply | number",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args);
      if (!target) {
        await m.reply("ᴜsᴇ: .delsudo @user ʏᴀ ʀᴇᴘʟʏ ʏᴀ ɴᴜᴍʙᴇʀ");
        return;
      }
      const data = botStore.load(context.session);
      const before = (data.sudo || []).map((item) => toUserJid(item)).filter(Boolean);
      const list = before.filter((item) => !sameJid(item, target, sock));
      if (list.length === before.length) {
        await m.reply("ʏᴇʜ sᴜᴅᴏ ʟɪsᴛ ᴍᴇ ɴᴀʜɪ ʜᴀɪ");
        return;
      }
      botStore.update(context.session, { sudo: list });
      await m.reply("sᴜᴅᴏ ʜᴀᴛᴀ ᴅɪʏᴀ\n" + formatNumberLine(target));
    } catch (err) {
      console.error("[delsudo] failed:", err.message);
      await m.reply("ᴅᴇʟsᴜᴅᴏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
