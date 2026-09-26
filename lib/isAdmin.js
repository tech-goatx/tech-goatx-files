const { sameUser, participantIds, fetchGroupMeta } = require("./jid");
const { isPairedOwner } = require("./isOwner");
const { isMaster } = require("./isMaster");

async function isAdmin(jid, sock, session, groupMeta) {
  try {
    let meta = groupMeta;
    const chat =
      (groupMeta && groupMeta.id) ||
      (session && session.chat) ||
      "";
    if (!meta && sock && chat) {
      meta = await fetchGroupMeta(sock, chat);
    }
    if (!meta || !Array.isArray(meta.participants)) return false;
    return meta.participants.some((p) => {
      if (!p) return false;
      if (p.admin !== "admin" && p.admin !== "superadmin") return false;
      return sameUser(jid, participantIds(p), sock);
    });
  } catch (err) {
    console.error("[isAdmin] failed:", err.message);
    return false;
  }
}

async function isAdminOrOwner(jid, sock, session, groupMeta) {
  try {
    if (await isMaster(jid, sock, session)) return true;
    if (await isPairedOwner(jid, sock, session)) return true;
    return await isAdmin(jid, sock, session, groupMeta);
  } catch (err) {
    console.error("[isAdminOrOwner] failed:", err.message);
    return false;
  }
}

module.exports = { isAdmin, isAdminOrOwner };
