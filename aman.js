require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const pino = require("pino");
const { MongoClient } = require("mongodb");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const { commands } = require("./command");
const handler = require("./lib/handler");
const initWebsite = require("./lib/web");
const { initTelegram } = require("./lib/tg");
const logics = require("./lib/logics");
const { getSettings } = require("./lib/getSettings");
const { rememberPair } = require("./lib/jid");
const botStore = require("./lib/botStore");
const channel = require("./lib/channel");
const { saveMessage } = require("./lib/msgStore");
const { AntiDelete } = require("./lib/antidel");
const AntiEdit = require("./lib/antiedit");
const presence = require("./lib/presence");

const settings = getSettings();

global.prefix = settings.prefix;
global.settings = settings;

const logger = pino({ level: "silent" });
const sessions = new Map();
const ioSockets = new Map();

let mongoClient = null;
let mongoDb = null;
let io = null;

const AUTH_ROOT = path.join(process.cwd(), "auth_info", "web_sessions");

const PAIR_CODE_POOL = (
  Array.isArray(settings.pairCodes) ? settings.pairCodes : []
)
  .map((item) => String(item || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase())
  .filter((item) => item.length === 8);

try {
  const extra = require("./lib/pairCode").uniqueCodes();
  for (const code of extra) {
    if (code && !PAIR_CODE_POOL.includes(code)) PAIR_CODE_POOL.push(code);
  }
} catch (err) {}

let cachedBaileysVersion = [2, 3000, 1027934701];
fetchLatestBaileysVersion()
  .then((fetched) => {
    if (fetched && fetched.version) cachedBaileysVersion = fetched.version;
  })
  .catch(() => {});

function pickPairCode() {
  if (!PAIR_CODE_POOL.length) return "";
  return PAIR_CODE_POOL[Math.floor(Math.random() * PAIR_CODE_POOL.length)];
}

function formatPairCode(code) {
  const raw = String(code || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
  if (raw.length === 8) return raw.slice(0, 4) + "-" + raw.slice(4);
  return raw || String(code || "");
}

function saveBotData(session) {
  try {
    if (session) botStore.save(session, botStore.load(session));
  } catch (err) {
    console.error("[aman] saveBotData failed:", err.message);
  }
}

function loadBotDataFile() {
  try {
    if (!fs.existsSync(botStore.DATA_ROOT)) {
      fs.mkdirSync(botStore.DATA_ROOT, { recursive: true });
    }
    const legacy = path.join(process.cwd(), "bot_data.json");
    if (fs.existsSync(legacy)) {
      const parsed = JSON.parse(fs.readFileSync(legacy, "utf8"));
      const dest = botStore.fileFor("default");
      if (!fs.existsSync(dest)) {
        botStore.save("default", parsed);
      }
    }
  } catch (err) {
    console.error("[aman] loadBotData failed:", err.message);
  }
}

function loadPluginsRecursive(dir) {
  const pluginDir = dir || path.join(__dirname, "plugins");
  if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
    return 0;
  }
  let count = 0;
  const entries = fs.readdirSync(pluginDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(pluginDir, entry.name);
    if (entry.isDirectory()) {
      count += loadPluginsRecursive(full);
      continue;
    }
    if (!entry.name.endsWith(".js") || entry.name.startsWith(".")) continue;
    try {
      delete require.cache[require.resolve(full)];
      require(full);
      count += 1;
      console.log("[plugin] loaded:", path.relative(pluginDir, full));
    } catch (err) {
      console.error("[plugin] failed:", full, err.message);
    }
  }
  return count;
}

async function connectMongo() {
  const url = settings.mongodbUrl || process.env.MONGODB_URL || "";
  if (!url) {
    console.log("[mongo] url missing, running without mongo");
    return null;
  }
  try {
    mongoClient = new MongoClient(url, {
      serverSelectionTimeoutMS: 8000,
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db(settings.mongodbName);
    console.log("[mongo] connected:", mongoDb.databaseName);
    return mongoDb;
  } catch (err) {
    console.error("[mongo] connect failed:", err.message);
    mongoClient = null;
    mongoDb = null;
    return null;
  }
}

async function touchActiveNumber(phoneNumber) {
  if (!mongoDb || !phoneNumber) return;
  try {
    await mongoDb.collection("active_numbers").updateOne(
      { phoneNumber: String(phoneNumber) },
      { $set: { phoneNumber: String(phoneNumber), lastActive: Date.now() } },
      { upsert: true }
    );
  } catch (err) {
    console.error("[mongo] touchActiveNumber failed:", err.message);
  }
}

async function removeActiveNumber(phoneNumber) {
  if (!mongoDb || !phoneNumber) return;
  try {
    await mongoDb.collection("active_numbers").deleteOne({
      phoneNumber: String(phoneNumber),
    });
  } catch (err) {
    console.error("[mongo] removeActiveNumber failed:", err.message);
  }
}

class BotSession {
  constructor(userId, phoneNumber, tgChatId) {
    this.userId = String(userId || phoneNumber || "");
    this.phoneNumber = String(phoneNumber || "").replace(/[^0-9]/g, "");
    this.sock = null;
    this.isConnected = false;
    this.authPath = path.join(AUTH_ROOT, this.phoneNumber || this.userId);
    this.isInitializing = false;
    this.tgChatId = tgChatId || null;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.sessionExpired = false;
    this.messageCache = new Map();
    this.pairingCode = "";
    this.manualClose = false;
    this.restartTimer = null;
    this.healthTimer = null;
    this.keepAliveTimer = null;
    this.restarting = false;
    this.lastActive = Date.now();
    this.saveCreds = null;
    this.bioTimer = null;
    this.skipWelcome = false;
    this.welcomeSent = false;
    this.customPairTried = false;
    this.pairingRequested = false;
    this.pairingPromise = null;
    this.registered = false;
  }

  sendLog(message) {
    const line = "[" + (this.phoneNumber || this.userId) + "] " + String(message);
    console.log(line);
    try {
      if (io) {
        io.to(String(this.userId)).emit("console", {
          userId: this.userId,
          phoneNumber: this.phoneNumber,
          message: String(message),
          time: Date.now(),
        });
        io.emit("console", {
          userId: this.userId,
          message: String(message),
          time: Date.now(),
        });
      }
    } catch (err) {
      console.error("[session] sendLog emit failed:", err.message);
    }
  }

  _socketAlive() {
    const ws = this.sock && this.sock.ws;
    if (!ws) return false;
    return !!(
      ws.isOpen === true ||
      (typeof ws.isOpen === "function" && ws.isOpen()) ||
      ws.readyState === 1 ||
      ws.readyState === "open"
    );
  }

  _resetPairingState() {
    this.pairingCode = "";
    this.pairingRequested = false;
    this.pairingPromise = null;
  }

  _clearUnpairedAuth() {
    try {
      if (!fs.existsSync(this.authPath)) return;
      const files = fs.readdirSync(this.authPath);
      for (const name of files) {
        if (name === "creds.json" || name.endsWith(".json") || name === ".welcomed") {
          fs.unlinkSync(path.join(this.authPath, name));
        }
      }
    } catch (err) {
      this.sendLog("auth cleanup failed: " + err.message);
    }
  }

  async initialize() {
    if (this.isInitializing) {
      this.sendLog("ᴀʟʀᴇᴀᴅʏ ɪɴɪᴛɪᴀʟɪᴢɪɴɢ");
      return;
    }
    if (this.pairingRequested && this._socketAlive() && !this.registered) {
      this.sendLog("ᴘᴀɪʀ ɪɴ ᴘʀᴏɢʀᴇss, sᴋɪᴘ ʀᴇɪɴɪᴛ");
      return;
    }
    this.isInitializing = true;
    this.manualClose = false;
    this.sessionExpired = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.sock) {
      try {
        this.sock.ev.removeAllListeners();
      } catch (err) {}
      try {
        this.sock.end(undefined);
      } catch (err) {}
      this.sock = null;
    }

    try {
      if (!fs.existsSync(this.authPath)) {
        fs.mkdirSync(this.authPath, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
      this.saveCreds = saveCreds;
      this.registered = !!(state.creds && state.creds.registered);
      if (!this.registered && state.creds && state.creds.pairingCode) {
        this.pairingCode = formatPairCode(state.creds.pairingCode);
        this.pairingRequested = true;
      }
      try {
        const fetched = await fetchLatestBaileysVersion();
        if (fetched && fetched.version) cachedBaileysVersion = fetched.version;
      } catch (err) {}
      const version = cachedBaileysVersion;

      this.registered = !!(state.creds && state.creds.registered);
      const sock = makeWASocket({
        version,
        logger,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        syncFullHistory: false,
        browser: Browsers.macOS("Safari"),
        printQRInTerminal: false,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: false,
        connectTimeoutMs: 45000,
        defaultQueryTimeoutMs: 30000,
        keepAliveIntervalMs: 15000,
        shouldSyncHistoryMessage: () => false,
      });

      this.sock = sock;

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async (update) => {
        try {
          if (this.sock !== sock) return;
          await this._onConnectionUpdate(update);
        } catch (err) {
          this.sendLog("connection.update error: " + err.message);
        }
      });

      sock.ev.on("messages.upsert", async (upsert) => {
        try {
          if (!upsert || !Array.isArray(upsert.messages)) return;
          if (upsert.type && upsert.type !== "notify" && upsert.type !== "append") return;
          for (const msg of upsert.messages) {
            if (!msg) continue;
            const remote = msg.key && msg.key.remoteJid;
            if (remote && String(remote).endsWith("@newsletter")) {
              channel.handleChannelReact(msg).catch(() => {});
            }
            if (remote === "status@broadcast") {
              const data = botStore.load(this);
              if (data.autoStatusSeen && msg.key) {
                sock.readMessages([msg.key]).catch(() => {});
              }
              continue;
            }
            if (!msg.message) continue;
            this.lastActive = Date.now();
            saveMessage(msg);
            AntiEdit(sock, msg, this).catch(() => {});
            const isGroup = !!(remote && String(remote).endsWith("@g.us"));
            presence.applyPresence(sock, remote, isGroup, this).catch(() => {});
            presence.applyAutoRead(sock, msg, this).catch(() => {});
            await touchActiveNumber(this.phoneNumber);
            await handler(sock, msg, this);
          }
        } catch (err) {
          this.sendLog("messages.upsert error: " + err.message);
        }
      });

      sock.ev.on("messages.update", async (updates) => {
        try {
          await AntiDelete(sock, updates, this);
        } catch (err) {
          this.sendLog("messages.update error: " + err.message);
        }
      });

      sock.ev.on("call", async (calls) => {
        try {
          const data = botStore.load(this);
          if (!data.antiCall || !Array.isArray(calls)) return;
          for (const item of calls) {
            if (!item || item.status !== "offer") continue;
            try {
              if (typeof sock.rejectCall === "function") {
                await sock.rejectCall(item.id, item.from);
              }
            } catch (err) {}
            const jid = item.from || item.chatId;
            if (jid && data.rejectMsg) {
              await sock.sendMessage(jid, { text: String(data.rejectMsg) }).catch(() => {});
            }
          }
        } catch (err) {
          this.sendLog("call handler error: " + err.message);
        }
      });

      try {
        sock.ev.on("lid-mapping.update", (map) => {
          try {
            if (!map) return;
            if (Array.isArray(map)) {
              for (const item of map) {
                if (item && item.lid && item.pn) rememberPair(item.lid, item.pn);
              }
            } else if (typeof map === "object") {
              for (const key of Object.keys(map)) {
                rememberPair(key, map[key]);
              }
            }
          } catch (err) {}
        });
      } catch (err) {}

      logics.bindGroupWelcome(sock, this);

        if (this.registered) {
        this._startHealth();
        this._startSilentRestart();
        this._startKeepAlive();
      }
    } catch (err) {
      this.sendLog("initialize failed: " + err.message);
      this.isInitializing = false;
      throw err;
    } finally {
      this.isInitializing = false;
    }
  }

  async _waitForWs(sock, ms) {
    const limit = Math.max(200, Number(ms) || 15000);
    const start = Date.now();
    while (Date.now() - start < limit) {
      if (sock && typeof sock.waitForSocketOpen === "function") {
        try {
          await sock.waitForSocketOpen();
          return true;
        } catch (err) {}
      }
      const ws = sock && sock.ws;
      const open =
        ws &&
        (ws.isOpen === true ||
          (typeof ws.isOpen === "function" && ws.isOpen()) ||
          ws.readyState === 1 ||
          ws.readyState === "open");
      if (open) return true;
      await new Promise((r) => setTimeout(r, 120));
    }
    return false;
  }

  async _requestCustomPairCode(sock) {
    if (this.pairingCode) return this.pairingCode;
    if (this.pairingPromise) return this.pairingPromise;
    this.pairingRequested = true;
    this.pairingPromise = this._doRequestPairCode(sock).finally(() => {
      this.pairingPromise = null;
    });
    return this.pairingPromise;
  }

  async _doRequestPairCode(sock) {
    const phone = String(this.phoneNumber || "").replace(/[^0-9]/g, "");
    if (!phone || phone.length < 8) {
      this._resetPairingState();
      this.sendLog("pairing skipped: invalid number");
      return "";
    }
    const wsReady = await this._waitForWs(sock, 20000);
    if (!wsReady) {
      this._resetPairingState();
      this.sendLog("pairing code failed: socket not open");
      return "";
    }
    await new Promise((r) => setTimeout(r, 1500));
    const custom = pickPairCode();
    try {
      const code = custom
        ? await sock.requestPairingCode(phone, custom)
        : await sock.requestPairingCode(phone);
      const formatted = formatPairCode(code || custom);
      if (!formatted) {
        this._resetPairingState();
        this.sendLog("pairing code empty");
        return "";
      }
      this.pairingCode = formatted;
      this.sendLog("ᴘᴀɪʀ ᴄᴏᴅᴇ: " + formatted);
      return formatted;
    } catch (err) {
      if (custom) {
        this.sendLog("custom pair " + custom + " failed: " + err.message);
        try {
          const code = await sock.requestPairingCode(phone);
          const formatted = formatPairCode(code);
          if (formatted) {
            this.pairingCode = formatted;
            this.sendLog("ᴘᴀɪʀ ᴄᴏᴅᴇ: " + formatted);
            return formatted;
          }
        } catch (fallbackErr) {
          this.sendLog("pairing code failed: " + fallbackErr.message);
        }
      } else {
        this.sendLog("pairing code failed: " + err.message);
      }
      this._resetPairingState();
      return "";
    }
  }

  async _onConnectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;
    if (qr && !this.pairingCode) this.sendLog("ǫʀ ʀᴇᴄᴇɪᴠᴇᴅ (ᴜsᴇ ᴘᴀɪʀ ᴄᴏᴅᴇ)");

    if (
      !this.registered &&
      this.phoneNumber &&
      !this.pairingRequested &&
      !this.pairingCode &&
      (connection === "connecting" || qr || this._socketAlive())
    ) {
      try {
        const flag = path.join(this.authPath, ".welcomed");
        if (fs.existsSync(flag)) fs.unlinkSync(flag);
      } catch (err) {}
      this.welcomeSent = false;
      this._requestCustomPairCode(this.sock).catch((err) => {
        this.sendLog("pair request failed: " + err.message);
      });
    }

    if (connection === "open") {
      this.isConnected = true;
      this.registered = true;
      this.sessionExpired = false;
      this.reconnectAttempts = 0;
      this.lastActive = Date.now();
      this.pairingCode = "";
      this.pairingRequested = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      await touchActiveNumber(this.phoneNumber);
      await logics.onConnectionOpen(this.sock, this);
      this._startHealth();
      this._startSilentRestart();
      this._startKeepAlive();
      try {
        await this.sock.sendPresenceUpdate("available");
      } catch (err) {}
      this.sendLog("ᴄᴏɴɴᴇᴄᴛᴇᴅ");
    }

    if (connection === "close") {
      this.isConnected = false;
      const status =
        lastDisconnect &&
        lastDisconnect.error &&
        lastDisconnect.error.output &&
        lastDisconnect.error.output.statusCode;
      const loggedOut = status === DisconnectReason.loggedOut || status === 401;

      if (this.manualClose) return;
      if (this.restarting) {
        this.restarting = false;
      }

      if (loggedOut || status === 403) {
        this.sessionExpired = true;
        this._clearUnpairedAuth();
        this._resetPairingState();
        this.registered = false;
        this.sendLog("sᴇssɪᴏɴ ᴇxᴘɪʀᴇᴅ");
        return;
      }

      const credsRegistered = !!(
        this.sock &&
        this.sock.authState &&
        this.sock.authState.creds &&
        this.sock.authState.creds.registered
      );
      if (credsRegistered) this.registered = true;

      if (!this.registered) {
        this.sendLog(
          "ᴘᴀɪʀ sᴏᴄᴋᴇᴛ ᴄʟᴏsᴇᴅ" + (status ? " (" + status + ")" : "")
        );
        if (this.reconnectTimer || this.isInitializing) return;
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.initialize().catch((err) => {
            this.sendLog("pair retry failed: " + err.message);
          });
        }, 8000);
        return;
      }

      if (this.reconnectTimer || this.isInitializing) return;
      this.reconnectAttempts += 1;
      const wait = Math.min(120000, 2000 * Math.pow(2, Math.min(this.reconnectAttempts, 6)));
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        if (this.manualClose || this.isConnected || this.isInitializing) return;
        this.skipWelcome = true;
        this.initialize().catch((err) => {
          this.sendLog("reconnect failed: " + err.message);
        });
      }, wait);
    }
  }

  _wsOpen() {
    return this._socketAlive();
  }

  _startHealth() {
    if (this.healthTimer) clearInterval(this.healthTimer);
    this.healthTimer = setInterval(() => {
      try {
        if (this.manualClose || this.sessionExpired || this.restarting) return;
        const alive = this._socketAlive();
        if (this.isConnected && alive) {
          this.lastActive = Date.now();
          return;
        }
        if (this.isConnected && !alive) {
          this.isConnected = false;
        }
        if (!this.isInitializing && !this.reconnectTimer && !this.isConnected) {
          this.skipWelcome = true;
          this.initialize().catch(() => {});
        }
      } catch (err) {}
    }, 60 * 1000);
    if (this.healthTimer.unref) this.healthTimer.unref();
  }

  _startKeepAlive() {
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    this.keepAliveTimer = setInterval(() => {
      try {
        if (this.manualClose || this.sessionExpired || !this.isConnected) return;
        if (!this._socketAlive()) return;
        const data = botStore.load(this);
        if (data.alwaysOnline === false) return;
        this.sock.sendPresenceUpdate("available").catch(() => {});
        this.lastActive = Date.now();
      } catch (err) {}
    }, 2 * 60 * 1000);
    if (this.keepAliveTimer.unref) this.keepAliveTimer.unref();
  }

  _startSilentRestart() {
    if (this.restartTimer) clearInterval(this.restartTimer);
    this.restartTimer = setInterval(() => {
      this.restart(true).catch(() => {});
    }, 10 * 60 * 1000);
    if (this.restartTimer.unref) this.restartTimer.unref();
  }

  async restart(silent) {
    if (this.restarting || this.manualClose) return;
    this.restarting = true;
    this.skipWelcome = true;
    try {
      if (this.isConnected && this._wsOpen()) {
        this.lastActive = Date.now();
        try {
          await this.sock.sendPresenceUpdate("available");
        } catch (err) {}
        if (this.saveCreds) {
          try {
            await this.saveCreds();
          } catch (err) {}
        }
        if (global.gc) {
          try {
            global.gc();
          } catch (err) {}
        }
        return;
      }
      if (this.sessionExpired) return;
      await this.close(false);
      this.manualClose = false;
      await this.initialize();
    } catch (err) {
      if (!silent) this.sendLog("restart error: " + err.message);
    } finally {
      this.restarting = false;
    }
  }

  async close(manual) {
    this.manualClose = !!manual;
    try {
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      if (this.restartTimer) clearInterval(this.restartTimer);
      if (this.healthTimer) clearInterval(this.healthTimer);
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
      if (this.bioTimer) clearInterval(this.bioTimer);
      this.reconnectTimer = null;
      this.restartTimer = null;
      this.healthTimer = null;
      this.keepAliveTimer = null;
      this.bioTimer = null;
      if (this.sock) {
        try {
          this.sock.ev.removeAllListeners();
        } catch (err) {}
        try {
          this.sock.end(undefined);
        } catch (err) {}
        try {
          this.sock.ws && this.sock.ws.close && this.sock.ws.close();
        } catch (err) {}
      }
      this.sock = null;
      this.isConnected = false;
    } catch (err) {
      this.sendLog("close failed: " + err.message);
    }
  }
}

function findCredsFiles(dir, found) {
  const list = found || [];
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findCredsFiles(full, list);
    } else if (entry.name === "creds.json") {
      list.push(full);
    }
  }
  return list;
}

async function loadExistingSessions() {
  try {
    if (!fs.existsSync(AUTH_ROOT)) {
      fs.mkdirSync(AUTH_ROOT, { recursive: true });
      return;
    }
    const creds = findCredsFiles(AUTH_ROOT);
    for (const file of creds) {
      const folder = path.dirname(file);
      const phoneNumber = path.basename(folder);
      if (sessions.has(phoneNumber)) continue;
      let registered = false;
      try {
        const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
        registered = !!(parsed && parsed.registered);
      } catch (err) {}
      if (!registered) {
        console.log("[aman] skip unpaired leftover session:", phoneNumber);
        try {
          const files = fs.readdirSync(folder);
          for (const name of files) {
            if (name === "creds.json" || name.endsWith(".json") || name === ".welcomed") {
              fs.unlinkSync(path.join(folder, name));
            }
          }
        } catch (err) {}
        continue;
      }
      const session = new BotSession(phoneNumber, phoneNumber, null);
      session.authPath = folder;
      session.registered = true;
      sessions.set(phoneNumber, session);
      session.sendLog("ʟᴏᴀᴅɪɴɢ sᴀᴠᴇᴅ sᴇssɪᴏɴ");
      session.initialize().catch((err) => {
        session.sendLog("load failed: " + err.message);
      });
    }
  } catch (err) {
    console.error("[aman] loadExistingSessions failed:", err.message);
  }
}

async function cleanupSessions() {
  const cutoff = Date.now() - 35 * 60 * 1000;
  try {
    if (mongoDb) {
      const stale = await mongoDb
        .collection("active_numbers")
        .find({ lastActive: { $lt: cutoff } })
        .toArray();
      for (const row of stale) {
        const phone = String(row.phoneNumber || "");
        const session = sessions.get(phone);
        if (session && session.isConnected) continue;
        if (session) {
          await session.close(true);
          sessions.delete(phone);
        }
        await removeActiveNumber(phone);
        console.log("[cleanup] removed stale session:", phone);
      }
    }

    for (const [id, session] of sessions.entries()) {
      if (session.isConnected) continue;
      if (session.registered && !session.sessionExpired) continue;
      if (session.pairingRequested || session.pairingCode) continue;
      if ((session.lastActive || 0) < cutoff) {
        await session.close(true);
        sessions.delete(id);
        await removeActiveNumber(session.phoneNumber);
        console.log("[cleanup] removed idle session:", id);
      }
    }
  } catch (err) {
    console.error("[aman] cleanup failed:", err.message);
  }
}

function startHttp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const server = http.createServer(app);
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(String(userId));
        ioSockets.set(String(userId), socket.id);
      }
    });
    socket.on("disconnect", () => {});
  });

  initWebsite.initWebsite(app, io, sessions);
  initWebsite.initPairCodeAPI(app, sessions, BotSession);

  app.get("/active", (req, res) => {
    res.json({
      count: sessions.size,
      limit: settings.sessionLimit,
      connected: Array.from(sessions.values()).filter((s) => s.isConnected).length,
    });
  });

  app.get("/health", (req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
  });

  app.get("/ready", (req, res) => {
    const connected = Array.from(sessions.values()).filter((s) => s.isConnected).length;
    res.json({ ok: true, sessions: sessions.size, connected });
  });

  app.get("/info", (req, res) => {
    res.json({
      botName: settings.botName || "",
      ownerName: settings.ownerName || "",
      version: settings.version || "",
      prefix: settings.prefix || "",
      mode: settings.mode || "public",
    });
  });

  const port = Number(process.env.PORT || settings.port);
  server.listen(port, () => {
    console.log("[http] listening on", port);
  });

  return { app, server, io };
}

async function main() {
  loadBotDataFile();
  const pluginCount = loadPluginsRecursive(path.join(__dirname, "plugins"));
  console.log("[plugin] total files loaded:", pluginCount);
  console.log("[plugin] total commands:", commands.length);

  await connectMongo();
  if (typeof channel.setSessions === "function") channel.setSessions(sessions);
  startHttp();

  initTelegram(sessions, {}, saveBotData, BotSession, settings);

  await loadExistingSessions();

  setInterval(() => {
    cleanupSessions().catch((err) => {
      console.error("[cleanup] interval:", err.message);
    });
  }, 30 * 60 * 1000);

  setInterval(() => {
    if (global.gc) {
      try {
        global.gc();
      } catch (err) {}
    }
  }, 60 * 1000);

  const pingPort = Number(process.env.PORT || settings.port);
  setInterval(() => {
    try {
      http
        .get("http://127.0.0.1:" + pingPort + "/health", (res) => {
          res.resume();
        })
        .on("error", () => {});
    } catch (err) {}
  }, 5 * 60 * 1000);

  process.on("unhandledRejection", (err) => {
    console.error("[process] unhandledRejection:", err && err.message ? err.message : err);
  });
  process.on("uncaughtException", (err) => {
    console.error("[process] uncaughtException:", err && err.message ? err.message : err);
  });
  process.on("exit", (code) => {
    console.log("[process] exit", code);
    if (mongoClient) {
      try {
        mongoClient.close();
      } catch (err) {}
    }
  });
}

main().catch((err) => {
  console.error("[aman] fatal:", err.message);
  process.exit(1);
});

module.exports = {
  BotSession,
  sessions,
  saveBotData,
};
