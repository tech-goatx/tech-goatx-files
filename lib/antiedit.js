const { isJidGroup } = require("@whiskeysockets/baileys");
const { loadMessage } = require("./msgStore");
const botStore = require("./botStore");
const { getSettings } = require("./getSettings");
const { decodeJid } = require("./jid");

function getMessageContent(msg) {
  if (!msg) return "";
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage && msg.extendedTextMessage.text) {
    return msg.extendedTextMessage.text;
  }
  if (msg.imageMessage && msg.imageMessage.caption) return msg.imageMessage.caption;
  if (msg.videoMessage && msg.videoMessage.caption) return msg.videoMessage.caption;
  if (msg.message) return getMessageContent(msg.message);
  return "";
}

function botInbox(sock) {
  if (!sock || !sock.user) return "";
  return decodeJid(sock.user.id);
}

async function AntiEdit(sock, msg, session) {
  try {
    if (!msg || !msg.message || !msg.message.protocolMessage) return;
    const protocolMsg = msg.message.protocolMessage;
    if (!protocolMsg.editedMessage) return;
    const data = botStore.load(session);
    if (!data.antiEdit) return;

    const messageId = protocolMsg.key && protocolMsg.key.id;
    if (!messageId) return;
    const originalMsg = loadMessage(messageId);
    if (!originalMsg || !originalMsg.message) return;
    const originalMessageObj = originalMsg.message;
    if (originalMessageObj.key && originalMessageObj.key.fromMe) return;

    const editorJid = msg.key.participant || msg.key.remoteJid;
    const botNumber = botInbox(sock);
    if (editorJid && botNumber && decodeJid(editorJid) === botNumber) return;

    const originalText = getMessageContent(originalMessageObj);
    const editedText = getMessageContent(protocolMsg.editedMessage);
    if (!originalText && !editedText) return;

    const sender =
      (originalMessageObj.key &&
        (originalMessageObj.key.participant || originalMessageObj.key.remoteJid)) ||
      "";
    if (!sender) return;
    const senderNumber = String(sender).split("@")[0];
    const isGroup = isJidGroup(originalMsg.jid);
    const settings = getSettings();
    const botName = settings.botName || "bot";
    const jid =
      data.antiEditPath === "inbox"
        ? botInbox(sock)
        : isGroup
          ? originalMsg.jid
          : originalMsg.jid;
    if (!jid) return;

    const alertText =
      "*edited message*\n" +
      "bot: " +
      botName +
      "\n" +
      "sender: @" +
      senderNumber +
      "\n" +
      "action: edited a message\n\n" +
      "*original*\n" +
      (originalText || "[empty]") +
      "\n\n" +
      "*edited to*\n" +
      (editedText || "[empty]");

    const mentionedJid = [sender];
    if (msg.key.participant && msg.key.participant !== sender) {
      mentionedJid.push(msg.key.participant);
    }
    await sock.sendMessage(
      jid,
      { text: alertText, mentions: mentionedJid },
      { quoted: originalMessageObj }
    );
  } catch (err) {}
}

module.exports = AntiEdit;
