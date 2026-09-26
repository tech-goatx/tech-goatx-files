const fs = require("fs");
const path = require("path");

class JsonDatabase {
  constructor(filePath, defaults) {
    this.filePath = path.resolve(filePath);
    this.defaults = defaults && typeof defaults === "object" ? defaults : {};
    this.data = Object.assign({}, this.defaults);
    this._ensure();
    this.load();
  }

  _ensure() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(
          this.filePath,
          JSON.stringify(this.defaults, null, 2),
          "utf8"
        );
      }
    } catch (err) {
      console.error("[database] ensure failed:", err.message);
    }
  }

  load() {
    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      this.data = Object.assign({}, this.defaults, parsed);
      return this.data;
    } catch (err) {
      console.error("[database] load failed:", err.message);
      this.data = Object.assign({}, this.defaults);
      return this.data;
    }
  }

  save() {
    try {
      this._ensure();
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
      return true;
    } catch (err) {
      console.error("[database] save failed:", err.message);
      return false;
    }
  }

  get(key, fallback) {
    if (!key) return this.data;
    if (Object.prototype.hasOwnProperty.call(this.data, key)) return this.data[key];
    return fallback;
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
    return value;
  }

  delete(key) {
    delete this.data[key];
    this.save();
  }

  all() {
    return this.data;
  }
}

const root = path.join(__dirname, "..");

const botData = new JsonDatabase(path.join(root, "bot_data.json"), {
  mode: "",
  bannedJids: [],
  sudo: [],
  prefix: "",
  welcome: true,
});

const contacts = new JsonDatabase(path.join(root, "contacts.json"), {
  list: {},
});

function readJson(file, fallback) {
  try {
    const full = path.isAbsolute(file) ? file : path.join(root, file);
    if (!fs.existsSync(full)) return fallback != null ? fallback : {};
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    console.error("[database] readJson failed:", err.message);
    return fallback != null ? fallback : {};
  }
}

function writeJson(file, data) {
  try {
    const full = path.isAbsolute(file) ? file : path.join(root, file);
    const dir = path.dirname(full);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(full, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[database] writeJson failed:", err.message);
    return false;
  }
}

module.exports = {
  JsonDatabase,
  botData,
  contacts,
  readJson,
  writeJson,
};
