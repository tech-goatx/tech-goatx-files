const fs = require("fs");
const path = require("path");
const { getSettings } = require("./getSettings");

const DATA_ROOT = path.join(__dirname, "..", "bot_data");

function digitsOf(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function resolvePhone(sessionOrPhone) {
  if (!sessionOrPhone) return "";
  if (typeof sessionOrPhone === "string") return digitsOf(sessionOrPhone);
  return digitsOf(sessionOrPhone.phoneNumber || sessionOrPhone.userId || "");
}

function fileFor(sessionOrPhone) {
  const digits = resolvePhone(sessionOrPhone);
  if (!fs.existsSync(DATA_ROOT)) {
    fs.mkdirSync(DATA_ROOT, { recursive: true });
  }
  if (!digits) return path.join(DATA_ROOT, "default.json");
  return path.join(DATA_ROOT, digits + ".json");
}

function defaults() {
  const settings = getSettings();
  return {
    mode: settings.mode || "public",
    bannedJids: [],
    sudo: [],
    prefix: settings.prefix || ".",
    welcome: true,
    goodbye: true,
    welcomeMessage: "",
    goodbyeMessage: "",
    adminAction: false,
    antiDelete: false,
    antiDeletePath: "same",
    antiEdit: false,
    antiEditPath: "same",
    alwaysOnline: true,
    autoTyping: false,
    autoRecording: false,
    autoRead: false,
    autoStatusSeen: false,
    antiCall: false,
    rejectMsg: "calls not allowed on this number",
    antiLink: "off",
    autoReact: false,
  };
}

function load(sessionOrPhone) {
  try {
    let data = defaults();
    const file = fileFor(sessionOrPhone);
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
      data = Object.assign(data, parsed);
    }
    if (!Array.isArray(data.sudo)) data.sudo = [];
    if (!Array.isArray(data.bannedJids)) data.bannedJids = [];
    if (!data.mode) data.mode = "public";
    if (!data.prefix) data.prefix = defaults().prefix;
    if (data.antiDeletePath !== "inbox") data.antiDeletePath = "same";
    if (data.antiEditPath !== "inbox") data.antiEditPath = "same";
    return data;
  } catch (err) {
    console.error("[botStore] load failed:", err.message);
    return defaults();
  }
}

function save(sessionOrPhone, data) {
  try {
    const next = Object.assign(defaults(), data || {});
    if (!Array.isArray(next.sudo)) next.sudo = [];
    if (!Array.isArray(next.bannedJids)) next.bannedJids = [];
    const file = fileFor(sessionOrPhone);
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(next, null, 2), "utf8");
    return next;
  } catch (err) {
    console.error("[botStore] save failed:", err.message);
    return data;
  }
}

function update(sessionOrPhone, patch) {
  return save(sessionOrPhone, Object.assign(load(sessionOrPhone), patch || {}));
}

module.exports = {
  DATA_ROOT,
  fileFor,
  resolvePhone,
  defaults,
  load,
  save,
  update,
};
