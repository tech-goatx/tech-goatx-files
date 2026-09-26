const { isMaster } = require("./isMaster");
const { isPairedOwner } = require("./isOwner");
const { isSudoOnly } = require("./isSudo");
const { isAdmin } = require("./isAdmin");

async function isNormal(jid, sock, session, groupMeta) {
  try {
    if (await isMaster(jid, sock, session)) return false;
    if (await isPairedOwner(jid, sock, session)) return false;
    if (isSudoOnly(jid, sock, session)) return false;
    if (await isAdmin(jid, sock, session, groupMeta)) return false;
    return true;
  } catch (err) {
    console.error("[isNormal] failed:", err.message);
    return true;
  }
}

module.exports = { isNormal };
