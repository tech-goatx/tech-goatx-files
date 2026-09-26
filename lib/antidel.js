const { isJidGroup } = require("@whiskeysockets/baileys");
const { loadMessage } = require("./msgStore");
const botStore = require("./botStore");
const { getSettings } = require("./getSettings");
const { decodeJid } = require("./jid");

const MEDIA_TYPES = [
  "imageMessage",
  "videoMessage",
  "audioMessage",
  "documentMessage",
  "stickerMessage",
];

function botInbox(sock) {
  if (!sock || !sock.user) return "";
  return decodeJid(sock.user.id);
}

function textOf(msg) {
  if (!msg) return "";
  const content = msg.message || msg;
  return (
    content.conversation ||
    (content.extendedTextMessage && content.extendedTextMessage.text) ||
    ""
  );
}

async function sendSafe(sock, jid, payload, quoted) {
  try {
    await sock.sendMessage(jid, payload, quoted ? { quoted } : {});
  } catch (err) {
    const m = err && err.message ? err.message : "";
    if (m.includes("rate-overlimit") || m.includes("429")) return;
  }
}

async function AntiDelete(sock, updates, session) {
  try {
    if (!sock || !Array.isArray(updates)) return;
    const data = botStore.load(session);
    if (!data.antiDelete) return;
    const settings = getSettings();
    const botName = settings.botName || "bot";

    for (const update of updates) {
      try {
        if (!update || !update.key || !update.key.id) continue;
        if (!update.update || update.update.message !== null) continue;
        const stored = loadMessage(update.key.id);
        if (!stored || !stored.message || !stored.jid) continue;
        const mek = stored.message;
        if (mek.key && mek.key.fromMe) continue;
        const isGroup = isJidGroup(stored.jid);
        let jid;
        if (data.antiDeletePath === "inbox") {
          jid = botInbox(sock);
        } else {
          jid = isGroup ? stored.jid : update.key.remoteJid || stored.jid;
        }
        if (!jid) continue;

        let senderNumber = "unknown";
        if (isGroup && mek.key && mek.key.participant) {
          senderNumber = String(mek.key.participant).split("@")[0];
        } else if (mek.key && mek.key.remoteJid) {
          senderNumber = String(mek.key.remoteJid).split("@")[0];
        }

        const deleteInfo =
          "*deleted message*\n" +
          "bot: " +
          botName +
          "\n" +
          "sender: @" +
          senderNumber +
          "\n" +
          "action: deleted a message";

        const mentioned = [];
        if (isGroup && mek.key && mek.key.participant) {
          mentioned.push(mek.key.participant);
        } else if (!isGroup && mek.key && mek.key.remoteJid) {
          mentioned.push(mek.key.remoteJid);
        }

        const body = textOf(mek);
        if (body) {
          await sendSafe(
            sock,
            jid,
            { text: deleteInfo + "\n\n" + body, mentions: mentioned },
            mek
          );
          continue;
        }
        const keys = Object.keys(mek.message || {});
        const isMedia = keys.some((key) => MEDIA_TYPES.includes(key));
        if (!isMedia) continue;
        await sendSafe(
          sock,
          jid,
          { text: deleteInfo, mentions: mentioned },
          mek
        );
        try {
          await sock.relayMessage(jid, mek.message, {});
        } catch (err) {}
      } catch (err) {}
    }
  } catch (err) {}
}

module.exports = { AntiDelete };
