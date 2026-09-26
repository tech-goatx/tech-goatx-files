const axios = require("axios");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, Number(ms) || 0));
}

async function getBuffer(url, options) {
  try {
    const res = await axios({
      method: "get",
      url,
      headers: { DNT: 1, "Upgrade-Insecure-Request": 1 },
      responseType: "arraybuffer",
      timeout: 30000,
      ...(options || {}),
    });
    return Buffer.from(res.data);
  } catch (err) {
    console.error("[function] getBuffer failed:", err.message);
    return null;
  }
}

function getGroupAdmins(participants) {
  if (!Array.isArray(participants)) return [];
  return participants
    .filter((p) => p && (p.admin === "admin" || p.admin === "superadmin"))
    .map((p) => p.id || p.jid)
    .filter(Boolean);
}

function h2k(number) {
  const num = Number(number);
  if (!isFinite(num)) return "0";
  const abs = Math.abs(num);
  if (abs >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
  if (abs >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(num);
}

function runtime(seconds) {
  const sec = Math.floor(Number(seconds) || process.uptime());
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const parts = [];
  if (d) parts.push(d + "d");
  if (h) parts.push(h + "h");
  if (m) parts.push(m + "m");
  parts.push(s + "s");
  return parts.join(" ");
}

function lidToPhone(jid, sock) {
  try {
    if (!jid) return "";
    const raw = String(jid);
    if (raw.endsWith("@s.whatsapp.net") || raw.endsWith("@g.us")) return raw;
    if (sock && sock.signalRepository && sock.user) {
      if (raw === sock.user.id || raw === sock.user.lid) {
        return sock.user.id;
      }
    }
    if (raw.endsWith("@lid") && sock && sock.store && sock.store.contacts) {
      const contacts = sock.store.contacts;
      for (const key of Object.keys(contacts)) {
        const c = contacts[key];
        if (c && (c.lid === raw || c.id === raw)) {
          return c.id || key;
        }
      }
    }
    return raw;
  } catch (err) {
    return String(jid || "");
  }
}

function formatJid(number) {
  const digits = String(number || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  return digits + "@s.whatsapp.net";
}

function pickRandom(list) {
  if (!Array.isArray(list) || !list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function sleep(ms) {
  return delay(ms);
}

module.exports = {
  delay,
  sleep,
  getBuffer,
  getGroupAdmins,
  h2k,
  runtime,
  lidToPhone,
  formatJid,
  pickRandom,
};
