const { findCommand } = require("../command");
const fontManager = require("../lib/fontManager");
const { sendNewsletter } = require("../lib/newsletter");
const { loadBotImage } = require("../lib/welcome");
const { getSettings } = require("../lib/getSettings");
const cfg = require("./config");
const replies = require("./replies");
const { pickRoast } = require("./roast");

const welcomeSeen = new Map();
const roastSeen = new Map();

function loadSettings() {
  return getSettings();
}

function extractAfterJarvis(text) {
  const stripped = fontManager.stripJarvis
    ? fontManager.stripJarvis(text)
    : String(text || "")
        .replace(/^[@]?\s*(hey|hi|hello)?\s*jarvis[,!\s:-]*/i, "")
        .trim();
  return fontManager.normalizeText(stripped);
}

function containsAny(haystack, list) {
  const n = fontManager.normalizeText(haystack);
  return list.some((word) => {
    const w = fontManager.normalizeText(word);
    if (!w) return false;
    if (w.includes(" ")) return n.includes(w);
    return new RegExp(
      "\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"
    ).test(n);
  });
}

function isReplyToJarvis(m, sock) {
  try {
    if (!m.quoted) return false;
    const botId = sock && sock.user ? sock.user.id : "";
    const botLid = sock && sock.user ? sock.user.lid : "";
    const qsender = String(m.quoted.sender || "");
    if (botId && qsender) {
      const botNum = String(botId).split(":")[0].split("@")[0];
      if (qsender.includes(botNum)) return true;
    }
    if (botLid && qsender && qsender.includes(String(botLid).split("@")[0])) {
      return true;
    }
    if (m.quoted.fakeObj && m.quoted.fakeObj.key && m.quoted.fakeObj.key.fromMe) {
      return true;
    }
    const q = fontManager.normalizeText(m.quoted.text || m.quoted.body || "");
    return q.includes("jarvis") || q.includes("ᴊᴀʀᴠɪs");
  } catch (err) {
    return false;
  }
}

async function sendWelcome(sock, m, force) {
  const last = welcomeSeen.get(m.sender) || 0;
  if (!force && Date.now() - last < cfg.WELCOME_WINDOW_MS) return false;
  welcomeSeen.set(m.sender, Date.now());
  const image = await loadBotImage();
  const text = replies.randomWelcome();
  try {
    if (image) {
      await sock.sendMessage(
        m.chat,
        { image, caption: text },
        { quoted: m.raw }
      );
    } else {
      await sendNewsletter(sock, m.chat, text, m.raw);
    }
  } catch (err) {
    await m.reply(text);
  }
  return true;
}

async function handleAlive(sock, m) {
  await sendNewsletter(sock, m.chat, replies.randomAlive(), m.raw);
}

async function handleRoast(sock, m) {
  const last = roastSeen.get(m.sender) || 0;
  if (Date.now() - last < cfg.ROAST_COOLDOWN_MS) {
    await m.reply("ɪɢɴᴏʀᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ");
    return;
  }
  roastSeen.set(m.sender, Date.now());
  await m.reply(pickRoast());
}

async function runCommand(sock, m, session, rest) {
  const settings = loadSettings();
  const prefix = global.prefix || settings.prefix || ".";
  const parts = String(rest || "").trim().split(/\s+/);
  const name = fontManager.normalizeText(parts.shift() || "");
  const command = findCommand(name);
  if (!command) return false;
  const args = parts;
  const text = parts.join(" ");
  const handler = require("../lib/handler");
  const fakeRaw = Object.assign({}, m.raw, {
    message: { conversation: prefix + rest },
    key: Object.assign({}, m.raw.key, {
      id: "JARVIS" + Date.now().toString(16) + Math.random().toString(16).slice(2, 6),
    }),
  });
  const parsed = handler.sms(sock, fakeRaw) || m;
  parsed.body = prefix + rest;
  parsed.text = prefix + rest;
  const exec = command.execute || command.function;
  if (typeof exec !== "function") return false;
  const context = {
    from: m.from,
    chat: m.chat,
    sender: m.sender,
    senderJid: m.senderJid,
    args,
    body: parsed.body,
    text,
    mtype: m.mtype,
    isGroup: m.isGroup,
    mentionedJid: m.mentionedJid,
    quoted: m.quoted,
    pushname: m.pushName || "",
    session,
    sock,
    conn: sock,
    prefix,
    command: name,
    cmd: command,
    reply: m.reply.bind(m),
    react: m.react.bind(m),
    download: m.download.bind(m),
  };
  await m.reply(replies.randomProcessing());
  await exec(sock, parsed, context, args);
  return true;
}

async function chat(sock, m, session) {
  try {
    if (!m || !m.body) return false;

    const mentioned = fontManager.isJarvisMention(m.body);
    const replyJarvis = isReplyToJarvis(m, sock);
    if (!mentioned && !replyJarvis) return false;

    const rest = mentioned
      ? extractAfterJarvis(m.body)
      : fontManager.normalizeText(m.body);

    if (!rest) {
      await sendWelcome(sock, m, true);
      return true;
    }

    if (containsAny(rest, cfg.INSULT_KEYWORDS)) {
      await handleRoast(sock, m);
      return true;
    }

    if (containsAny(rest, cfg.ALIVE_KEYWORDS)) {
      await handleAlive(sock, m);
      return true;
    }

    const ran = await runCommand(sock, m, session, rest);
    if (ran) return true;

    await m.reply(
      "ᴊᴀʀᴠɪs ʏᴀʜᴀ ʜᴀɪ\n" +
        (global.prefix || ".") +
        "menu ʟɪᴋʜᴏ ʏᴀ `jarvis ping`"
    );
    return true;
  } catch (err) {
    console.error("[jarvis] chat failed:", err.message);
    try {
      await m.reply("ᴊᴀʀᴠɪs ғᴀɪʟᴇᴅ: " + err.message);
    } catch (e) {}
    return true;
  }
}

module.exports = {
  chat,
  extractAfterJarvis,
  isReplyToJarvis,
};
