const { decodeJid, sameUser, collectIds, lidToPhone } = require("./jid");
const { isOwner } = require("./isOwner");
const botStore = require("./botStore");

function loadSudoList(session) {
  try {
    const data = botStore.load(session);
    return collectIds([].concat(data.sudo || [], data.sudos || []));
  } catch (err) {
    return [];
  }
}

function isSudoOnly(jid, sock, session) {
  const list = loadSudoList(session);
  if (!list.length) return false;
  const incoming = collectIds(Array.isArray(jid) ? jid : [jid]);
  const extra = incoming.map((item) => lidToPhone(item, sock)).filter(Boolean);
  return sameUser(incoming.concat(extra), list, sock);
}

async function isSudo(jid, sock, session) {
  try {
    if (await isOwner(jid, sock, session)) return true;
    return isSudoOnly(jid, sock, session);
  } catch (err) {
    console.error("[isSudo] failed:", err.message);
    return false;
  }
}

module.exports = { isSudo, isSudoOnly, loadSudoList, decodeJid };
