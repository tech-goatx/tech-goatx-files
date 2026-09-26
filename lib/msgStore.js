const fs = require("fs");
const path = require("path");

const STORE_DIR = path.join(process.cwd(), "store");
const STORE_FILE = path.join(STORE_DIR, "message.json");
const MAX_MESSAGES = 4000;

let cache = null;
let writeTimer = null;

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
}

function loadAll() {
  if (cache) return cache;
  try {
    ensureDir();
    if (!fs.existsSync(STORE_FILE)) {
      cache = [];
      return cache;
    }
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    cache = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    cache = [];
  }
  return cache;
}

function flush() {
  try {
    ensureDir();
    const data = loadAll();
    fs.writeFileSync(STORE_FILE, JSON.stringify(data), "utf8");
  } catch (err) {
    console.error("[msgStore] flush failed:", err.message);
  }
}

function scheduleFlush() {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    flush();
  }, 800);
  if (writeTimer.unref) writeTimer.unref();
}

function saveMessage(raw) {
  try {
    if (!raw || !raw.key || !raw.key.id) return;
    const id = raw.key.id;
    const jid = raw.key.remoteJid;
    if (!jid || jid === "status@broadcast") return;
    const list = loadAll();
    const stamp = raw.messageTimestamp
      ? Number(raw.messageTimestamp) * 1000
      : Date.now();
    const index = list.findIndex((item) => item.id === id && item.jid === jid);
    const row = { id, jid, message: raw, timestamp: stamp };
    if (index > -1) list[index] = row;
    else list.push(row);
    if (list.length > MAX_MESSAGES) list.splice(0, list.length - MAX_MESSAGES);
    cache = list;
    scheduleFlush();
  } catch (err) {}
}

function loadMessage(id) {
  if (!id) return null;
  const list = loadAll();
  return list.find((item) => item.id === id) || null;
}

module.exports = {
  saveMessage,
  loadMessage,
  flush,
};
