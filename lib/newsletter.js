const { getSettings } = require("./getSettings");

function loadSettings() {
  return getSettings();
}

function newsletterContext(extra) {
  const settings = loadSettings();
  const jid =
    settings.channelJid ||
    (Array.isArray(settings.mainChannels) && settings.mainChannels[0]) ||
    "";
  const name = settings.channelName || settings.botName || "";
  const base = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: jid,
      newsletterName: name,
      serverMessageId: -1,
    },
  };
  return Object.assign(base, extra || {});
}

async function sendNewsletter(sock, jid, content, quoted) {
  try {
    const payload =
      typeof content === "string" ? { text: content } : Object.assign({}, content);
    payload.contextInfo = Object.assign(
      newsletterContext(),
      payload.contextInfo || {}
    );
    return await sock.sendMessage(jid, payload, quoted ? { quoted } : undefined);
  } catch (err) {
    console.error("[newsletter] send failed:", err.message);
    return null;
  }
}

module.exports = {
  newsletterContext,
  sendNewsletter,
};
