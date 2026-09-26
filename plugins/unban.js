const { cmd } = require("../command");
const { extractTarget } = require("../lib/cmdutil");
const botStore = require("../lib/botStore");
const { sameUser } = require("../lib/jid");

cmd(
  {
    pattern: "unban",
    alias: ["unblockuser"],
    desc: "unban a user",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "✅",
    usage: ".unban @user | reply | number",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args);
      if (!target) {
        await m.reply("ᴜsᴇ: .unban @user ʏᴀ ʀᴇᴘʟʏ");
        return;
      }
      const data = botStore.load(context.session);
      const list = (data.bannedJids || []).filter((id) => !sameUser(id, target, sock));
      botStore.update(context.session, { bannedJids: list });
      await m.reply("ᴜɴʙᴀɴɴᴇᴅ @" + String(target).split("@")[0], { mentions: [target] });
    } catch (err) {
      await m.reply("ᴜɴʙᴀɴ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
