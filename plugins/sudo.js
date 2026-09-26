const { cmd } = require("../command");
const botStore = require("../lib/botStore");
const { extractTarget, toUserJid, sameJid, formatNumberLine } = require("../lib/cmdutil");
const { isMaster } = require("../lib/isMaster");
const { isPairedOwner } = require("../lib/isOwner");

cmd(
  {
    pattern: "sudo",
    alias: ["addsudo", "setsudo"],
    desc: "add a second owner (sudo)",
    category: "owner",
    role: "owner",
    filename: __filename,
    react: "👑",
    usage: ".sudo @user | reply | number",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args);
      if (!target) {
        const data = botStore.load(context.session);
        const list = (data.sudo || []).map(formatNumberLine).filter(Boolean);
        await m.reply(
          list.length
            ? "sᴜᴅᴏ ʟɪsᴛ:\n" + list.join("\n")
            : "sᴜᴅᴏ ʟɪsᴛ ᴋʜᴀʟɪ ʜᴀɪ\nᴜsᴇ: .sudo @user"
        );
        return;
      }
      if (await isMaster(target, sock, context.session)) {
        await m.reply("ʏᴇʜ ᴍᴀsᴛᴇʀ ʜᴀɪ, sᴜᴅᴏ ɴᴀʜɪ ʙᴀɴᴇɢᴀ");
        return;
      }
      if (await isPairedOwner(target, sock, context.session)) {
        await m.reply("ʏᴇʜ ᴘᴇʜʟᴇ sᴇ ᴏᴡɴᴇʀ ʜᴀɪ");
        return;
      }
      const data = botStore.load(context.session);
      const list = (data.sudo || []).map((item) => toUserJid(item)).filter(Boolean);
      if (list.some((item) => sameJid(item, target, sock))) {
        await m.reply("ʏᴇʜ ᴘᴇʜʟᴇ sᴇ sᴜᴅᴏ ʜᴀɪ\n" + formatNumberLine(target));
        return;
      }
      list.push(target);
      botStore.update(context.session, { sudo: list });
      await m.reply("sᴜᴅᴏ ᴀᴅᴅ ʜᴏ ɢᴀʏᴀ\n" + formatNumberLine(target));
    } catch (err) {
      console.error("[sudo] failed:", err.message);
      await m.reply("sᴜᴅᴏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
