const { sendImage } = require("./connection");
const { toSmallCaps } = require("./fontManager");
const { getBuffer } = require("./function");
const { getSettings } = require("./getSettings");
const botStore = require("./botStore");
const { decodeJid, lidToPhone } = require("./jid");
const path = require("path");
const fs = require("fs");

function loadSettings() {
  return getSettings();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fillTemplate(template, vars) {
  let out = String(template || "");
  out = out.replace(/@user/g, vars.user || "");
  out = out.replace(/@group/g, vars.group || "");
  out = out.replace(/@desc/g, vars.desc || "");
  out = out.replace(/@count/g, String(vars.count || 0));
  out = out.replace(/@bot/g, vars.bot || "");
  out = out.replace(/@time/g, vars.time || "");
  return out;
}

function welcomeCaption(name, groupName) {
  const settings = loadSettings();
  return (
    toSmallCaps("welcome") +
    " " +
    (name || "user") +
    "\n" +
    toSmallCaps("group") +
    ": " +
    (groupName || "") +
    "\n" +
    toSmallCaps("bot") +
    ": " +
    (settings.botName || "")
  );
}

function goodbyeCaption(name, groupName) {
  return (
    toSmallCaps("goodbye") +
    " " +
    (name || "user") +
    "\n" +
    toSmallCaps("group") +
    ": " +
    (groupName || "")
  );
}

async function loadBotImage() {
  const settings = loadSettings();
  const imageName =
    settings.imageFile ||
    (settings.imagePath ? path.basename(settings.imagePath) : "");
  const imagePath = imageName
    ? path.join(process.cwd(), "public", imageName)
    : "";
  try {
    if (imagePath && fs.existsSync(imagePath)) return fs.readFileSync(imagePath);
  } catch (err) {
    console.error("[welcome] local image failed:", err.message);
  }
  if (settings.imageUrl) {
    const buf = await getBuffer(settings.imageUrl);
    if (buf) return buf;
  }
  return null;
}

function userNameOf(jid, sock) {
  const id = decodeJid(jid);
  const phone = lidToPhone(id, sock) || id;
  return String(phone).split("@")[0] || "unknown";
}

async function handleParticipantsUpdate(sock, update, session) {
  try {
    if (!update || !update.id || !Array.isArray(update.participants)) return;
    const action = update.action;
    const groupId = update.id;
    const data = botStore.load(session);
    const settings = loadSettings();
    const needWelcome = action === "add" && data.welcome !== false;
    const needGoodbye = action === "remove" && data.goodbye !== false;
    const needAdmin = (action === "promote" || action === "demote") && data.adminAction;
    if (!needWelcome && !needGoodbye && !needAdmin) return;

    const meta = await sock.groupMetadata(groupId).catch(() => null);
    if (!meta) return;
    const groupName = meta.subject || "";
    const desc = meta.desc || "no description";
    const count = Array.isArray(meta.participants) ? meta.participants.length : 0;
    const timestamp = new Date().toLocaleString();
    const image = needWelcome ? await loadBotImage() : null;

    for (const user of update.participants) {
      const jid =
        typeof user === "string"
          ? user
          : String(
              (user && (user.phoneNumber || user.jid || user.id || user.lid)) ||
                ""
            );
      if (!jid) continue;
      const name = userNameOf(jid, sock);
      const vars = {
        user: "@" + name,
        group: groupName,
        desc,
        count,
        bot: settings.botName || "bot",
        time: timestamp,
      };

      if (needWelcome) {
        const caption = data.welcomeMessage
          ? fillTemplate(data.welcomeMessage, vars)
          : welcomeCaption(name, groupName);
        if (image) {
          await sendImage(sock, groupId, image, caption);
        } else {
          await sock.sendMessage(groupId, { text: caption, mentions: [jid] });
        }
        await delay(800);
      } else if (needGoodbye) {
        const caption = data.goodbyeMessage
          ? fillTemplate(data.goodbyeMessage, vars)
          : goodbyeCaption(name, groupName);
        await sock.sendMessage(groupId, { text: caption, mentions: [jid] });
        await delay(800);
      } else if (needAdmin) {
        const author = update.author || "";
        const authorName = author ? userNameOf(author, sock) : "someone";
        const verb = action === "promote" ? "promoted" : "demoted";
        const mentions = author ? [author, jid] : [jid];
        await sock.sendMessage(groupId, {
          text: "@" + authorName + " " + verb + " @" + name,
          mentions,
        });
        await delay(400);
      }
    }
  } catch (err) {
    console.error("[welcome] handle failed:", err.message);
  }
}

module.exports = {
  handleParticipantsUpdate,
  welcomeCaption,
  goodbyeCaption,
  loadBotImage,
};
