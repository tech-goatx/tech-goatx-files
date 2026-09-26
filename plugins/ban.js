const { cmd } = require("../command");
const { extractTarget } = require("../lib/cmdutil");
const botStore = require("../lib/botStore");
const { sameUser } = require("../lib/jid");

cmd(
  {
    pattern: "ban",
    alias: ["blockuser"],
    desc: "ban a user from using the bot",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "🔨",
    usage: ".ban @user | reply | number",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args);
      if (!target) {
        await m.reply("ᴜsᴇ: .ban @user ʏᴀ ʀᴇᴘʟʏ");
        return;
      }
      if (context.isMaster && sameUser(target, m.sender, sock)) {
        await m.reply("ᴄᴀɴɴᴏᴛ ʙᴀɴ ᴍᴀsᴛᴇʀ");
        return;
      }
      const data = botStore.load(context.session);
      const list = data.bannedJids || [];
      if (list.some((id) => sameUser(id, target, sock))) {
        await m.reply("ᴀʟʀᴇᴀᴅʏ ʙᴀɴɴᴇᴅ");
        return;
      }
      list.push(target);
      botStore.update(context.session, { bannedJids: list });
      await m.reply("ʙᴀɴɴᴇᴅ @" + String(target).split("@")[0], { mentions: [target] });
    } catch (err) {
      await m.reply("ʙᴀɴ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
