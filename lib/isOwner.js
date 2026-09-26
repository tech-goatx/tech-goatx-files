const { decodeJid, digitsOf, sameUser, lidToPhone, collectIds, botIdentities } = require("./jid");
const { isMaster } = require("./isMaster");

function pairedOwnerJid(sock, session) {
  return botIdentities(sock, session);
}

async function isPairedOwner(jid, sock, session) {
  try {
    const list = pairedOwnerJid(sock, session);
    if (!list.length) return false;
    const incoming = collectIds(Array.isArray(jid) ? jid : [jid]);
    const extra = incoming.map((item) => lidToPhone(item, sock)).filter(Boolean);
    const candidates = collectIds(incoming.concat(extra));
    if (!candidates.length) return false;
    return sameUser(candidates, list, sock);
  } catch (err) {
    return false;
  }
}

async function isOwner(jid, sock, session) {
  try {
    if (await isMaster(jid, sock, session)) return true;
    return await isPairedOwner(jid, sock, session);
  } catch (err) {
    console.error("[isOwner] failed:", err.message);
    return false;
  }
}

module.exports = { isOwner, isPairedOwner, pairedOwnerJid, decodeJid, digitsOf };
