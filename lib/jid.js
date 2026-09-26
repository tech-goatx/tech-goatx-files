const lidPnMap = new Map();

function digitsOf(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function decodeJid(jid) {
  if (!jid) return "";
  try {
    const raw = String(jid);
    if (/:\d+@/.test(raw)) {
      const [user, server] = raw.split("@");
      return user.split(":")[0] + "@" + (server || "s.whatsapp.net");
    }
    return raw;
  } catch (err) {
    return String(jid || "");
  }
}

function rememberPair(a, b) {
  const left = decodeJid(a);
  const right = decodeJid(b);
  if (!left || !right || left === right) return;
  lidPnMap.set(left, right);
  lidPnMap.set(right, left);
}

function rememberFromKey(key, raw) {
  if (!key) return;
  const participant = key.participant || (raw && raw.participant);
  const participantPn =
    key.participantPn ||
    key.participantAlt ||
    (raw && (raw.participantPn || raw.participantAlt));
  const remote = key.remoteJid;
  const remoteAlt = key.remoteJidAlt || key.remoteJidPn;
  if (participant && participantPn) rememberPair(participant, participantPn);
  if (remote && remoteAlt) rememberPair(remote, remoteAlt);
  if (key.senderPn && participant) rememberPair(participant, key.senderPn);
  if (key.senderLid && participantPn) rememberPair(key.senderLid, participantPn);
}

function mapped(jid) {
  const id = decodeJid(jid);
  if (!id) return "";
  return decodeJid(lidPnMap.get(id) || "");
}

function collectIds(value) {
  const out = [];
  const seen = new Set();
  function push(item) {
    if (item == null || item === "") return;
    if (Array.isArray(item)) {
      for (const nested of item) push(nested);
      return;
    }
    const id = decodeJid(item);
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(id);
  }
  push(value);
  for (const id of out.slice()) {
    const alt = mapped(id);
    if (alt) push(alt);
  }
  return out;
}

function lidToPhone(jid, sock) {
  try {
    if (!jid) return "";
    const raw = decodeJid(jid);
    if (raw.endsWith("@s.whatsapp.net") || raw.endsWith("@g.us")) return raw;
    const cached = mapped(raw);
    if (cached && cached.endsWith("@s.whatsapp.net")) return cached;
    if (sock && sock.user) {
      const userId = decodeJid(sock.user.id);
      const userLid = decodeJid(sock.user.lid);
      if (raw === userLid && userId) return userId;
      if (raw === userId) return userId;
    }
    const repo = sock && sock.signalRepository;
    const mapping = repo && (repo.lidMapping || repo.lidPnMapping);
    if (mapping && raw.endsWith("@lid")) {
      try {
        if (typeof mapping.getPNForLID === "function") {
          const pn = mapping.getPNForLID(raw);
          if (pn) {
            rememberPair(raw, pn);
            return decodeJid(pn);
          }
        }
        if (typeof mapping.getPNForLIDSync === "function") {
          const pn = mapping.getPNForLIDSync(raw);
          if (pn) {
            rememberPair(raw, pn);
            return decodeJid(pn);
          }
        }
      } catch (err) {}
    }
    if (raw.endsWith("@lid") && sock && sock.store && sock.store.contacts) {
      const contacts = sock.store.contacts;
      for (const key of Object.keys(contacts)) {
        const c = contacts[key];
        if (c && (c.lid === raw || c.id === raw || decodeJid(c.lid) === raw)) {
          const phone = c.notify || c.id || key;
          const decoded = decodeJid(phone);
          if (decoded.endsWith("@s.whatsapp.net")) {
            rememberPair(raw, decoded);
            return decoded;
          }
        }
      }
    }
    return raw;
  } catch (err) {
    return decodeJid(jid);
  }
}

function sameUser(a, b, sock) {
  const left = collectIds(a);
  const right = collectIds(b);
  if (!left.length || !right.length) return false;
  for (const x of left) {
    if (right.includes(x)) return true;
    const alt = lidToPhone(x, sock);
    if (alt && right.includes(decodeJid(alt))) return true;
  }
  const leftDigits = left.map(digitsOf).filter((d) => d.length >= 8);
  const rightDigits = right.map(digitsOf).filter((d) => d.length >= 8);
  if (!leftDigits.length || !rightDigits.length) return false;
  return leftDigits.some((d) => rightDigits.includes(d));
}

function participantIds(p) {
  if (!p) return [];
  if (typeof p === "string") return collectIds(p);
  return collectIds(
    [p.id, p.jid, p.lid, p.phoneNumber, p.pn, p.participant].filter(Boolean)
  );
}

function withTimeout(promise, ms, fallback) {
  const wait = Number(ms) || 8000;
  let timer = null;
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => {
      timer = setTimeout(() => resolve(fallback), wait);
      if (timer.unref) timer.unref();
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function botIdentities(sock, session) {
  const ids = [];
  if (session && session.phoneNumber) {
    const digits = digitsOf(session.phoneNumber);
    if (digits) ids.push(digits + "@s.whatsapp.net");
  }
  if (sock && sock.user) {
    if (sock.user.id) ids.push(decodeJid(sock.user.id));
    if (sock.user.lid) ids.push(decodeJid(sock.user.lid));
    if (sock.user.pn) ids.push(decodeJid(sock.user.pn));
  }
  return collectIds(ids);
}

function resolveSender(raw, sock, session) {
  if (!raw || !raw.key) return "";
  const key = raw.key;
  rememberFromKey(key, raw);
  const chat = decodeJid(key.remoteJid || "");
  const isGroup = chat.endsWith("@g.us");

  if (key.fromMe) {
    const mine = botIdentities(sock, session);
    return mine[0] || decodeJid((sock && sock.user && sock.user.id) || chat);
  }

  if (isGroup) {
    const ids = collectIds([
      key.participantPn,
      key.participantAlt,
      raw.participantPn,
      raw.participantAlt,
      key.senderPn,
      key.participant,
      raw.participant,
      key.senderLid,
    ]);
    const pn = ids.find((id) => id.endsWith("@s.whatsapp.net"));
    const chosen = pn || ids[0] || "";
    return lidToPhone(chosen, sock) || chosen;
  }

  const ids = collectIds([
    key.remoteJidAlt,
    key.remoteJidPn,
    key.senderPn,
    key.remoteJid,
  ]);
  const pn = ids.find((id) => id.endsWith("@s.whatsapp.net"));
  const chosen = pn || ids[0] || chat;
  return lidToPhone(chosen, sock) || chosen;
}

function rememberParticipants(meta) {
  try {
    if (!meta || !Array.isArray(meta.participants)) return;
    for (const p of meta.participants) {
      if (!p || typeof p !== "object") continue;
      if (p.id && p.phoneNumber) rememberPair(p.id, p.phoneNumber);
      if (p.id && p.pn) rememberPair(p.id, p.pn);
      if (p.lid && p.phoneNumber) rememberPair(p.lid, p.phoneNumber);
      if (p.lid && p.id && String(p.id).endsWith("@s.whatsapp.net")) {
        rememberPair(p.lid, p.id);
      }
      if (p.jid && p.lid) rememberPair(p.jid, p.lid);
    }
  } catch (err) {}
}

const groupMetaCache = new Map();

async function fetchGroupMeta(sock, chat) {
  if (!sock || !chat) return null;
  const cached = groupMetaCache.get(chat);
  if (cached && Date.now() - cached.at < 20000) return cached.meta;
  const meta = await withTimeout(sock.groupMetadata(chat), 3000, cached ? cached.meta : null);
  if (meta) {
    rememberParticipants(meta);
    groupMetaCache.set(chat, { meta, at: Date.now() });
  }
  return meta;
}

module.exports = {
  digitsOf,
  decodeJid,
  rememberPair,
  rememberFromKey,
  mapped,
  collectIds,
  lidToPhone,
  sameUser,
  participantIds,
  withTimeout,
  botIdentities,
  resolveSender,
  fetchGroupMeta,
  rememberParticipants,
  lidPnMap,
  groupMetaCache,
};
