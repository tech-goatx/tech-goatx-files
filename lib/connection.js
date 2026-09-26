const axios = require("axios");
const { proto } = require("@whiskeysockets/baileys");

function decodeJid(jid) {
  if (!jid) return "";
  try {
    const raw = String(jid);
    if (raw.endsWith("@lid")) return raw;
    if (/:\d+@/.test(raw)) {
      const [user, server] = raw.split("@");
      return user.split(":")[0] + "@" + server;
    }
    return raw;
  } catch (err) {
    return String(jid || "");
  }
}

function parseMention(text) {
  if (!text) return [];
  const matches = String(text).match(/@(\d{5,16})/g) || [];
  return matches.map((item) => item.replace("@", "") + "@s.whatsapp.net");
}

async function downloadMediaMessage(message, sock) {
  try {
    const baileys = require("@whiskeysockets/baileys");
    const download =
      baileys.downloadMediaMessage || baileys.downloadContentFromMessage;
    if (!download) return null;

    if (baileys.downloadMediaMessage) {
      const buffer = await baileys.downloadMediaMessage(
        message,
        "buffer",
        {},
        {
          logger: require("pino")({ level: "silent" }),
          reuploadRequest: sock && sock.updateMediaMessage,
        }
      );
      return buffer;
    }

    const msg = message.message || message;
    const type = Object.keys(msg || {})[0];
    const stream = await baileys.downloadContentFromMessage(msg[type], type.replace("Message", ""));
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  } catch (err) {
    console.error("[connection] downloadMediaMessage failed:", err.message);
    return null;
  }
}

async function sendText(sock, jid, text, quoted) {
  try {
    return await sock.sendMessage(
      jid,
      { text: String(text) },
      quoted ? { quoted } : undefined
    );
  } catch (err) {
    console.error("[connection] sendText failed:", err.message);
    return null;
  }
}

async function sendImage(sock, jid, image, caption, quoted) {
  try {
    const payload = Buffer.isBuffer(image)
      ? { image, caption: caption || "" }
      : { image: { url: image }, caption: caption || "" };
    return await sock.sendMessage(jid, payload, quoted ? { quoted } : undefined);
  } catch (err) {
    console.error("[connection] sendImage failed:", err.message);
    return null;
  }
}

async function sendFileUrl(sock, jid, url, caption, quoted) {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      maxRedirects: 5,
    });
    const buffer = Buffer.from(res.data);
    const mime = (res.headers["content-type"] || "").split(";")[0];
    let payload;
    if (mime.startsWith("image/")) {
      payload = { image: buffer, caption: caption || "" };
    } else if (mime.startsWith("video/")) {
      payload = { video: buffer, caption: caption || "" };
    } else if (mime.startsWith("audio/")) {
      payload = { audio: buffer, mimetype: mime };
    } else {
      payload = {
        document: buffer,
        mimetype: mime || "application/octet-stream",
        fileName: url.split("/").pop() || "file",
        caption: caption || "",
      };
    }
    return await sock.sendMessage(jid, payload, quoted ? { quoted } : undefined);
  } catch (err) {
    console.error("[connection] sendFileUrl failed:", err.message);
    return null;
  }
}

module.exports = {
  decodeJid,
  downloadMediaMessage,
  sendText,
  sendImage,
  sendFileUrl,
  parseMention,
  proto,
};
