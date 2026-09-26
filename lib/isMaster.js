const { decodeJid, digitsOf, sameUser, lidToPhone, collectIds } = require("./jid");
const { getSettings, coreConfig } = require("./getSettings");

function collectMasterIds(settings) {
  const ids = [];
  const numbers = [].concat(
    coreConfig.masterNumbers || [],
    (settings && settings.masterNumbers) || [],
    (settings && settings.masters) || []
  );
  const jids = [].concat(
    coreConfig.masterJids || [],
    (settings && settings.masterJids) || [],
    (settings && settings.masterJid) || []
  );
  for (const n of numbers) {
    const digits = digitsOf(n);
    if (digits) ids.push(digits + "@s.whatsapp.net");
  }
  for (const j of jids) {
    if (j) ids.push(decodeJid(j));
  }
  return collectIds(ids);
}

function collectMasterDigits(settings) {
  const out = [];
  const seen = new Set();
  const ids = collectMasterIds(settings);
  for (const id of ids) {
    const d = digitsOf(id);
    if (d && d.length >= 8 && !seen.has(d)) {
      seen.add(d);
      out.push(d);
    }
  }
  return out;
}

async function isMaster(jidOrList, sock) {
  try {
    const settings = getSettings();
    const list = collectMasterIds(settings);
    if (!list.length) return false;
    const incoming = collectIds(
      Array.isArray(jidOrList) ? jidOrList : [jidOrList]
    );
    if (!incoming.length) return false;

    for (const item of incoming) {
      if (sameUser(item, list, sock)) return true;
      const phone = lidToPhone(item, sock);
      if (phone && sameUser(phone, list, sock)) return true;
    }

    const masterDigits = collectMasterDigits(settings);
    for (const item of incoming) {
      const d = digitsOf(lidToPhone(item, sock) || item);
      if (d && d.length >= 8 && masterDigits.includes(d)) return true;
    }
    return false;
  } catch (err) {
    console.error("[isMaster] failed:", err.message);
    return false;
  }
}

module.exports = { isMaster, collectMasterIds, collectMasterDigits };
