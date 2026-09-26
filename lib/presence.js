const botStore = require("./botStore");

async function applyPresence(sock, chat, isGroup, session) {
  try {
    if (!sock || !chat) return;
    const data = botStore.load(session);
    if (data.alwaysOnline) {
      await sock.sendPresenceUpdate("available", chat).catch(() => {});
    }
    if (data.autoTyping) {
      await sock.sendPresenceUpdate("composing", chat).catch(() => {});
    } else if (data.autoRecording) {
      await sock.sendPresenceUpdate("recording", chat).catch(() => {});
    }
  } catch (err) {}
}

async function applyAutoRead(sock, raw, session) {
  try {
    if (!sock || !raw || !raw.key) return;
    const data = botStore.load(session);
    if (!data.autoRead) return;
    await sock.readMessages([raw.key]).catch(() => {});
  } catch (err) {}
}

module.exports = {
  applyPresence,
  applyAutoRead,
};
