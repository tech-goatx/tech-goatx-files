const {
  decodeJid,
  digitsOf,
  sameUser,
  collectIds,
  botIdentities,
  fetchGroupMeta,
  participantIds,
} = require("./jid");

function toUserJid(value) {
  if (!value) return "";
  const raw = decodeJid(value);
  if (!raw) return "";
  if (raw.endsWith("@g.us") || raw.endsWith("@broadcast")) return "";
  if (raw.endsWith("@lid")) return raw;
  if (raw.includes("@")) return raw;
  const digits = digitsOf(raw);
  return digits ? digits + "@s.whatsapp.net" : "";
}

function extractTarget(m, args) {
  if (m && Array.isArray(m.mentionedJid) && m.mentionedJid[0]) {
    return toUserJid(m.mentionedJid[0]);
  }
  if (m && m.quoted && m.quoted.sender) {
    return toUserJid(m.quoted.sender);
  }
  if (args && args[0]) {
    return toUserJid(args[0]);
  }
  return "";
}

function sameJid(a, b, sock) {
  return sameUser(a, b, sock);
}

async function botIsAdmin(sock, groupMeta, session) {
  try {
    if (!groupMeta || !Array.isArray(groupMeta.participants) || !sock || !sock.user) {
      return false;
    }
    const ids = botIdentities(sock, session);
    return groupMeta.participants.some((p) => {
      if (!p) return false;
      if (p.admin !== "admin" && p.admin !== "superadmin") return false;
      const pid = collectIds([p.id, p.jid, p.lid, p.phoneNumber, p.pn]);
      return sameUser(pid, ids, sock);
    });
  } catch (err) {
    return false;
  }
}

function formatNumberLine(jid) {
  const id = decodeJid(jid);
  const n = digitsOf(id);
  return n ? "+" + n : id;
}

async function requireGroupAdmin(sock, m, context) {
  if (!m.isGroup) {
    await m.reply("ʏᴇʜ ᴄᴍᴅ ɢʀᴏᴜᴘ ᴍᴇ ʜɪ ᴄʜᴀʟᴇɢɪ");
    return null;
  }
  const meta = (context && context.groupMetadata) || (await fetchGroupMeta(sock, m.chat));
  if (!meta) {
    await m.reply("ɢʀᴏᴜᴘ ɪɴғᴏ ɴᴀʜɪ ᴍɪʟɪ, ᴛʜᴏᴅɪ ᴅᴇʀ ʙᴀᴀᴅ ᴛʀʏ ᴋᴀʀᴏ");
    return null;
  }
  if (!(context.isMaster || context.isOwner || context.isSudo || context.isAdmin)) {
    await m.reply("sɪʀғ ᴀᴅᴍɪɴ / sᴜᴅᴏ / ᴏᴡɴᴇʀ / ᴍᴀsᴛᴇʀ");
    return null;
  }
  const adminBot = await botIsAdmin(sock, meta, context && context.session);
  if (!adminBot) {
    await m.reply("ᴘᴇʜʟᴇ ʙᴏᴛ ᴋᴏ ᴀᴅᴍɪɴ ʙᴀɴᴀᴏ");
    return null;
  }
  return meta;
}

function resolveParticipant(meta, target, sock) {
  if (!meta || !Array.isArray(meta.participants) || !target) return target;
  const found = meta.participants.find((p) =>
    sameUser(target, participantIds(p), sock)
  );
  if (!found) return target;
  const ids = participantIds(found);
  const lid = ids.find((id) => String(id).endsWith("@lid"));
  return lid || ids[0] || target;
}

module.exports = {
  digitsOf,
  toUserJid,
  extractTarget,
  sameJid,
  botIsAdmin,
  formatNumberLine,
  requireGroupAdmin,
  resolveParticipant,
};
