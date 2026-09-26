const { cmd } = require("../command");
const { extractTarget, toUserJid } = require("../lib/cmdutil");

cmd(
  {
    pattern: "newgc",
    alias: ["creategc", "create"],
    desc: "create a new group",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "🆕",
    usage: ".newgc GroupName @user",
  },
  async (sock, m, context) => {
    try {
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply("ᴜsᴇ: .newgc GroupName");
        return;
      }
      const members = [];
      const mentioned = (m.mentionedJid || []).filter(Boolean);
      mentioned.forEach((id) => members.push(id));
      const extra = extractTarget(m, context.args && context.args.slice(1));
      if (extra) members.push(extra);
      if (!members.length && sock.user) {
        members.push(toUserJid(sock.user.id));
      }
      const res = await sock.groupCreate(text.split("@")[0].trim() || text, members);
      const jid = res.gid || res.id;
      await m.reply("ɢʀᴏᴜᴘ ᴄʀᴇᴀᴛᴇᴅ: " + jid);
    } catch (err) {
      await m.reply("ɴᴇᴡɢᴄ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
