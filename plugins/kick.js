const { cmd } = require("../command");
const { extractTarget, sameJid, requireGroupAdmin, resolveParticipant } = require("../lib/cmdutil");
const { participantIds, sameUser, decodeJid } = require("../lib/jid");

cmd(
  {
    pattern: "kick",
    alias: ["remove", "out"],
    desc: "remove a member from group",
    category: "group",
    role: "admin",
    filename: __filename,
    react: "👢",
    usage: ".kick @user | reply",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const target = extractTarget(m, context.args);
      if (!target) {
        await m.reply("ᴜsᴇ: .kick @user ʏᴀ ʀᴇᴘʟʏ");
        return;
      }
      if (sameJid(target, m.sender, sock) && !context.isMaster) {
        await m.reply("ᴀᴘɴᴇ ᴀᴀᴘ ᴋᴏ ᴋɪᴄᴋ ɴᴀʜɪ ᴋᴀʀ sᴀᴋᴛᴇ");
        return;
      }
      if (sock.user && sameJid(target, sock.user.id, sock)) {
        await m.reply("ʙᴏᴛ ᴋᴏ ᴋɪᴄᴋ ɴᴀʜɪ ᴋᴀʀ sᴀᴋᴛᴇ");
        return;
      }
      const victim = resolveParticipant(meta, target, sock);
      const isTargetAdmin = meta.participants.some((p) => {
        if (!p || (p.admin !== "admin" && p.admin !== "superadmin")) return false;
        return sameUser(victim, participantIds(p), sock);
      });
      if (isTargetAdmin && !(context.isOwner || context.isMaster)) {
        await m.reply("ᴀᴅᴍɪɴ ᴋᴏ ᴋɪᴄᴋ ɴᴀʜɪ ᴋᴀʀ sᴀᴋᴛᴇ");
        return;
      }
      await sock.groupParticipantsUpdate(m.chat, [victim], "remove");
      await m.reply("ᴋɪᴄᴋ ʜᴏ ɢᴀʏᴀ\n@" + String(target).split("@")[0], {
        mentions: [decodeJid(target)],
      });
    } catch (err) {
      console.error("[kick] failed:", err.message);
      await m.reply("ᴋɪᴄᴋ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
