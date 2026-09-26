const { decodeJid } = require("./connection");
const { delay } = require("./function");
const { getSettings } = require("./getSettings");
const channel = require("./channel");
const bio = require("./bio");
const welcome = require("./welcome");

function botUserJid(sock) {
  if (!sock || !sock.user) return "";
  return decodeJid(sock.user.id || "");
}

async function sendConnectWelcome(sock, session) {
  try {
    if (!sock || session.welcomeSent || session.skipWelcome) return false;
    const settings = getSettings();
    const image = await welcome.loadBotImage();
    const prefix = settings.prefix || ".";
    const text =
      "ᴡᴇʟᴄᴏᴍᴇ ʙᴀʙʏ\n" +
      "ʙᴏᴛ: " +
      (settings.botName || "bot") +
      "\n" +
      "ᴏᴡɴᴇʀ: " +
      (settings.ownerName || "") +
      "\n" +
      "ᴘʀᴇғɪx: " +
      prefix +
      "\n" +
      "ᴍᴏᴅᴇ: " +
      (settings.mode || "public") +
      "\n\n" +
      prefix +
      "menu  |  " +
      prefix +
      "ping  |  " +
      prefix +
      "alive\n" +
      "ᴊᴀʀᴠɪs ʙᴏʟᴏ, ᴍᴀɪɴ sᴜɴ ʀᴀʜᴀ ʜᴜ";

    const targets = [];
    const selfJid = botUserJid(sock);
    if (selfJid) targets.push(selfJid);
    const ownerDigits = String(settings.ownerNumber || "").replace(/[^0-9]/g, "");
    if (ownerDigits) {
      const ownerJid = ownerDigits + "@s.whatsapp.net";
      if (!targets.includes(ownerJid)) targets.push(ownerJid);
    }

    let sent = false;
    for (const jid of targets) {
      try {
        if (image) {
          await sock.sendMessage(jid, { image, caption: text });
        } else {
          await sock.sendMessage(jid, { text });
        }
        sent = true;
      } catch (err) {
        console.error("[logics] welcome send failed:", jid, err.message);
      }
    }
    if (sent) {
      session.welcomeSent = true;
      if (session.sendLog) session.sendLog("ᴡᴇʟᴄᴏᴍᴇ ᴍsɢ ʙʜᴇᴊ ᴅɪ");
    }
    return sent;
  } catch (err) {
    console.error("[logics] sendConnectWelcome failed:", err.message);
    return false;
  }
}

async function onConnectionOpen(sock, session) {
  try {
    session.isConnected = true;
    session.sessionExpired = false;
    session.reconnectAttempts = 0;
    session.lastActive = Date.now();
    if (session.sendLog && !session.skipWelcome) {
      session.sendLog("ᴄᴏɴɴᴇᴄᴛᴇᴅ ʙᴀʙʏ, ʙᴏᴛ ᴏɴʟɪɴᴇ ʜᴏ ɢᴀʏᴀ");
    }
    await delay(1200);
    await sendConnectWelcome(sock, session);
    await channel.syncChannels(sock);
    if (!session.bioTimer) {
      session.bioTimer = bio.startBioLoop(sock, session);
    }
  } catch (err) {
    console.error("[logics] onConnectionOpen failed:", err.message);
  }
}

async function onConnectionClose(session, lastDisconnect, startFn) {
  try {
    session.isConnected = false;
    const status =
      lastDisconnect &&
      lastDisconnect.error &&
      lastDisconnect.error.output &&
      lastDisconnect.error.output.statusCode;
    if (session.manualClose) {
      if (session.sendLog) session.sendLog("sᴇssɪᴏɴ ᴍᴀɴᴜᴀʟʟʏ ᴄʟᴏsᴇᴅ");
      return;
    }
    if (status === 401 || status === 403) {
      session.sessionExpired = true;
      if (session.sendLog) session.sendLog("sᴇssɪᴏɴ ᴇxᴘɪʀᴇᴅ, ʀᴇ-ᴘᴀɪʀ ᴋᴀʀᴏ");
      return;
    }
    session.reconnectAttempts = (session.reconnectAttempts || 0) + 1;
    const wait = Math.min(30000, 2000 * session.reconnectAttempts);
    if (session.sendLog) {
      session.sendLog("ʀᴇᴄᴏɴɴᴇᴄᴛ " + session.reconnectAttempts + " ɪɴ " + wait + "ᴍs");
    }
    session.reconnectTimer = setTimeout(() => {
      if (typeof startFn === "function") startFn(session).catch(() => {});
    }, wait);
  } catch (err) {
    console.error("[logics] onConnectionClose failed:", err.message);
  }
}

function bindGroupWelcome(sock, session) {
  try {
    sock.ev.on("group-participants.update", (update) => {
      welcome.handleParticipantsUpdate(sock, update, session).catch((err) => {
        console.error("[logics] welcome failed:", err.message);
      });
    });
  } catch (err) {
    console.error("[logics] bindGroupWelcome failed:", err.message);
  }
}

function touchActivity(session) {
  session.lastActive = Date.now();
}

function isSameJid(a, b) {
  return decodeJid(a) === decodeJid(b);
}

module.exports = {
  onConnectionOpen,
  onConnectionClose,
  bindGroupWelcome,
  touchActivity,
  isSameJid,
  sendConnectWelcome,
  delay,
};
