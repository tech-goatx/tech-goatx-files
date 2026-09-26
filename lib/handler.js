const { findCommand } = require("../command");
const { downloadMediaMessage } = require("./connection");
const { getSettings } = require("./getSettings");
const fontManager = require("./fontManager");
const permissions = require("./permissions");
const botStore = require("./botStore");
const jarvis = require("../jarvis");
const {
  decodeJid,
  rememberFromKey,
  resolveSender,
  fetchGroupMeta,
  sameUser,
  collectIds,
  lidToPhone,
} = require("./jid");

const processedMessages = new Set();
const PROCESSED_CAP = 500;
const COOLDOWN_MS = 1500;
const cooldowns = new Map();

function loadSettings() {
  return getSettings();
}

function loadBotData(session) {
  try {
    return botStore.load(session);
  } catch (err) {
    console.error("[handler] bot_data load failed:", err.message);
    return { bannedJids: [], sudo: [], mode: "public", prefix: "." };
  }
}

function unwrapMessage(content) {
  if (!content || typeof content !== "object") return content;
  if (content.ephemeralMessage && content.ephemeralMessage.message) {
    return unwrapMessage(content.ephemeralMessage.message);
  }
  if (content.viewOnceMessageV2 && content.viewOnceMessageV2.message) {
    return unwrapMessage(content.viewOnceMessageV2.message);
  }
  if (content.viewOnceMessage && content.viewOnceMessage.message) {
    return unwrapMessage(content.viewOnceMessage.message);
  }
  if (content.viewOnceMessageV2Extension && content.viewOnceMessageV2Extension.message) {
    return unwrapMessage(content.viewOnceMessageV2Extension.message);
  }
  if (content.documentWithCaptionMessage && content.documentWithCaptionMessage.message) {
    return unwrapMessage(content.documentWithCaptionMessage.message);
  }
  if (content.editedMessage && content.editedMessage.message) {
    return unwrapMessage(content.editedMessage.message);
  }
  return content;
}

function getMessageType(content) {
  if (!content || typeof content !== "object") return "";
  const keys = Object.keys(content);
  return (
    keys.find(
      (key) =>
        key !== "senderKeyDistributionMessage" &&
        key !== "messageContextInfo" &&
        key !== "inviteLinkGroupTypeV2"
    ) || keys[0] || ""
  );
}

function extractBody(content, mtype) {
  if (!content) return "";
  if (content.conversation) return content.conversation;
  if (mtype === "imageMessage" && content.imageMessage && content.imageMessage.caption) {
    return content.imageMessage.caption;
  }
  if (mtype === "videoMessage" && content.videoMessage && content.videoMessage.caption) {
    return content.videoMessage.caption;
  }
  if (mtype === "documentMessage" && content.documentMessage && content.documentMessage.caption) {
    return content.documentMessage.caption;
  }
  if (mtype === "extendedTextMessage" && content.extendedTextMessage) {
    return content.extendedTextMessage.text || "";
  }
  if (mtype === "buttonsResponseMessage" && content.buttonsResponseMessage) {
    return (
      content.buttonsResponseMessage.selectedButtonId ||
      content.buttonsResponseMessage.selectedDisplayText ||
      ""
    );
  }
  if (mtype === "listResponseMessage" && content.listResponseMessage) {
    const list = content.listResponseMessage;
    return (
      (list.singleSelectReply && list.singleSelectReply.selectedRowId) ||
      list.title ||
      ""
    );
  }
  if (mtype === "templateButtonReplyMessage" && content.templateButtonReplyMessage) {
    return content.templateButtonReplyMessage.selectedId || "";
  }
  if (mtype === "interactiveResponseMessage" && content.interactiveResponseMessage) {
    try {
      const native = content.interactiveResponseMessage.nativeFlowResponseMessage;
      if (native && native.paramsJson) {
        const parsed = JSON.parse(native.paramsJson);
        return parsed.id || parsed.title || "";
      }
    } catch (err) {
      return "";
    }
  }
  return "";
}

function extractQuoted(content, chat) {
  const inner = content && content[getMessageType(content)];
  const ctx =
    (inner && inner.contextInfo) ||
    (content.extendedTextMessage && content.extendedTextMessage.contextInfo) ||
    null;
  if (!ctx || !ctx.quotedMessage) return null;

  const quotedContent = unwrapMessage(ctx.quotedMessage);
  const qtype = getMessageType(quotedContent);
  const qbody = extractBody(quotedContent, qtype);
  const mentionedJid = (ctx.mentionedJid || []).slice();

  return {
    type: qtype,
    id: ctx.stanzaId || "",
    chat: ctx.remoteJid || chat,
    sender:
      ctx.participantPn ||
      ctx.participantAlt ||
      ctx.participant ||
      ctx.remoteJid ||
      "",
    text: qbody,
    body: qbody,
    mentionedJid,
    message: quotedContent,
    fakeObj: {
      key: {
        remoteJid: ctx.remoteJid || chat,
        fromMe: false,
        id: ctx.stanzaId || "",
        participant: ctx.participant || undefined,
      },
      message: quotedContent,
    },
  };
}

function senderCandidates(raw, sock, session) {
  if (!raw || !raw.key) return [];
  const key = raw.key;
  rememberFromKey(key, raw);
  const primary = resolveSender(raw, sock, session);
  return collectIds([
    primary,
    key.participantPn,
    key.participantAlt,
    key.senderPn,
    key.senderLid,
    key.participant,
    raw.participantPn,
    raw.participantAlt,
    raw.participant,
    key.remoteJidAlt,
    key.remoteJidPn,
    key.remoteJid,
    lidToPhone(primary, sock),
  ]);
}

function sms(sock, raw, session) {
  if (!raw || !raw.key) return null;

  const key = raw.key;
  rememberFromKey(key, raw);
  const id = key.id;
  const chat = decodeJid(key.remoteJid || "");
  const isGroup = chat.endsWith("@g.us");
  const sender = resolveSender(raw, sock, session);
  const candidates = senderCandidates(raw, sock, session);

  const unwrapped = unwrapMessage(raw.message || {});
  const mtype = getMessageType(unwrapped);
  const msg = unwrapped[mtype] || unwrapped;
  const body = extractBody(unwrapped, mtype);
  const quoted = extractQuoted(unwrapped, chat);

  const mentionedJid = (
    (msg && msg.contextInfo && msg.contextInfo.mentionedJid) ||
    (unwrapped.extendedTextMessage &&
      unwrapped.extendedTextMessage.contextInfo &&
      unwrapped.extendedTextMessage.contextInfo.mentionedJid) ||
    []
  ).slice();

  const m = {
    id,
    chat,
    from: chat,
    sender,
    senderJid: sender,
    senderCandidates: candidates,
    isGroup,
    mtype,
    msg,
    body,
    text: body,
    mentionedJid,
    quoted,
    key,
    message: unwrapped,
    raw,
    pushName: raw.pushName || "",
    fromMe: !!key.fromMe,
  };

  m.getQuotedObj = async function getQuotedObj() {
    if (!quoted || !quoted.fakeObj) return null;
    return sms(sock, quoted.fakeObj, session);
  };

  m.download = async function download() {
    try {
      return await downloadMediaMessage(raw, sock);
    } catch (err) {
      console.error("[handler] download failed:", err.message);
      return null;
    }
  };

  m.copy = function copy() {
    return sms(sock, JSON.parse(JSON.stringify(raw)), session);
  };

  m.react = async function react(emoji) {
    try {
      await sock.sendMessage(chat, {
        react: {
          text: emoji || "",
          key: key,
        },
      });
    } catch (err) {
      console.error("[handler] react failed:", err.message);
    }
  };

  m.reply = async function reply(text, extra) {
    try {
      return await sock.sendMessage(
        chat,
        Object.assign({ text: String(text) }, extra || {}),
        { quoted: raw }
      );
    } catch (err) {
      console.error("[handler] reply failed:", err.message);
      return null;
    }
  };

  if (quoted) {
    quoted.download = async function downloadQuoted() {
      try {
        return await downloadMediaMessage(quoted.fakeObj, sock);
      } catch (err) {
        console.error("[handler] quoted download failed:", err.message);
        return null;
      }
    };
  }

  return m;
}

function rememberProcessed(id) {
  processedMessages.add(id);
  if (processedMessages.size > PROCESSED_CAP) {
    const first = processedMessages.values().next().value;
    processedMessages.delete(first);
  }
}

function getPrefix(settings, session) {
  try {
    const data = botStore.load(session);
    if (data && data.prefix != null && String(data.prefix) !== "") {
      return String(data.prefix);
    }
  } catch (err) {}
  if (settings && settings.prefix != null && settings.prefix !== "") {
    return String(settings.prefix);
  }
  return ".";
}

function cooldownKey(sender, pattern) {
  return sender + "::" + pattern;
}

function checkCooldown(sender, command) {
  const name = (command.pattern && command.pattern[0]) || "cmd";
  const key = cooldownKey(sender, name);
  const now = Date.now();
  const last = cooldowns.get(key) || 0;
  const wait = COOLDOWN_MS - (now - last);
  if (wait > 0) {
    return Math.ceil(wait / 1000);
  }
  cooldowns.set(key, now);
  return 0;
}

async function handler(sock, raw, session) {
  try {
    if (!raw || !raw.key) return;
    const id = raw.key.id;
    const remoteJid = raw.key.remoteJid;
    if (!id || !remoteJid) return;
    if (raw.key.remoteJid === "status@broadcast") return;
    const processedKey =
      ((session && (session.phoneNumber || session.userId)) || "") + "::" + id;
    if (processedMessages.has(processedKey)) return;
    rememberProcessed(processedKey);

    const m = sms(sock, raw, session);
    if (!m) return;

    const settings = loadSettings();
    const botData = loadBotData(session);

    if (m.body) {
      console.log("[msg]", m.chat, m.sender, m.body);
    }

    const prefix = getPrefix(settings, session);
    const isPrefixed = !!(m.body && prefix && m.body.startsWith(prefix));

    const jarvisHit =
      !m.fromMe &&
      ((m.body &&
        fontManager.isJarvisMention &&
        fontManager.isJarvisMention(m.body)) ||
        (jarvis.isReplyToJarvis && jarvis.isReplyToJarvis(m, sock)));
    if (jarvisHit) {
      try {
        await jarvis.chat(sock, m, session);
      } catch (err) {
        console.error("[handler] jarvis.chat failed:", err.message);
      }
      return;
    }

    if (m.isGroup && m.body && !m.fromMe) {
      const linkMode = String(botData.antiLink || "off").toLowerCase();
      if (linkMode && linkMode !== "off" && linkMode !== "false") {
        const hasLink = /https?:\/\/|wa\.me\/|chat\.whatsapp\.com/i.test(m.body);
        if (hasLink) {
          const who =
            m.senderCandidates && m.senderCandidates.length
              ? m.senderCandidates
              : m.sender;
          const skip =
            (await permissions.master.isMaster(who, sock, session)) ||
            (await permissions.owner.isPairedOwner(who, sock, session)) ||
            permissions.sudo.isSudoOnly(who, sock, session);
          if (!skip) {
            if (linkMode === "true" || linkMode === "on" || linkMode === "delete") {
              try {
                await sock.sendMessage(m.chat, { delete: raw.key });
              } catch (err) {}
            }
            if (linkMode === "true" || linkMode === "on" || linkMode === "warn") {
              await m.reply("ʟɪɴᴋs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ");
            }
          }
        }
      }
    }

    if (botData.autoReact && !m.fromMe) {
      m.react(settings.reactEmoji || "💀").catch(() => {});
    }

    if (!m.body || !isPrefixed) {
      return;
    }

    const trimmed = m.body.slice(prefix.length).trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const rawName = parts.shift() || "";
    const cmdName = fontManager.normalizeText
      ? fontManager.normalizeText(rawName)
      : rawName.toLowerCase();
    const args = parts;
    const text = parts.join(" ");

    const banned = botData.bannedJids || [];
    if (banned.length && banned.some((item) => sameUser(item, m.sender, sock))) {
      return;
    }

    const command = findCommand(cmdName);
    if (!command) return;

    const isGroup = m.isGroup;
    const needMeta =
      isGroup &&
      (String(command.role || "").toLowerCase() === "admin" ||
        String(command.category || "").toLowerCase() === "group");
    let groupMeta = null;
    if (needMeta) {
      groupMeta = await fetchGroupMeta(sock, m.chat);
      if (groupMeta) {
        const sender = resolveSender(raw, sock, session);
        m.sender = sender;
        m.senderJid = sender;
        m.senderCandidates = senderCandidates(raw, sock, session);
      }
    }

    const who =
      m.senderCandidates && m.senderCandidates.length ? m.senderCandidates : m.sender;
    const isMaster = await permissions.master.isMaster(who, sock, session);
    const isOwner = await permissions.owner.isPairedOwner(who, sock, session);
    const isSudo = permissions.sudo.isSudoOnly(who, sock, session);
    const isAdmin = isGroup
      ? await permissions.admin.isAdmin(who, sock, { chat: m.chat }, groupMeta)
      : false;

    const roles = { isMaster, isOwner, isSudo, isAdmin };
    const mode = String(botData.mode || settings.mode || "public").toLowerCase();

    const allowed = permissions.checkPermission(command, mode, roles);
    if (!allowed) {
      const cmdRole = permissions.commandRole(command);
      if (cmdRole === "master") return;
      if (mode === "public") {
        await m.reply("ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ ʙᴀʙʏ, ʏᴇʜ ᴄᴏᴍᴍᴀɴᴅ ᴛᴜᴍʜᴀʀᴇ ʟɪʏᴇ ɴᴀʜɪ ʜᴀɪ");
      }
      return;
    }

    const remain = isMaster ? 0 : checkCooldown(m.sender, command);
    if (remain > 0) {
      await m.reply("ᴛʜᴏᴅᴀ ʀᴜᴋᴏ ʙᴀʙʏ, " + remain + " sᴇᴄᴏɴᴅs ᴀᴜʀ ᴡᴀɪᴛ ᴋᴀʀᴏ");
      return;
    }

    if (command.react) {
      m.react(command.react).catch(() => {});
    }

    try {
      sock.sendPresenceUpdate("composing", m.chat).catch(() => {});
    } catch (err) {}

    const userRole = permissions.getUserRole(roles);
    const userRoleEmoji = permissions.getUserRoleEmoji(userRole);

    const context = {
      from: m.from,
      chat: m.chat,
      sender: m.sender,
      senderJid: m.senderJid,
      senderCandidates: m.senderCandidates,
      args,
      body: m.body,
      text,
      mtype: m.mtype,
      isGroup,
      mentionedJid: m.mentionedJid,
      quoted: m.quoted,
      pushname: m.pushName || "",
      isMaster,
      isOwner: !!(isOwner || isMaster),
      isSudo: !!(isSudo || isOwner || isMaster),
      isAdmin: !!(isAdmin || isSudo || isOwner || isMaster),
      userRole,
      userRoleEmoji,
      session,
      sock,
      conn: sock,
      prefix,
      command: cmdName,
      cmd: command,
      mode,
      groupMetadata: groupMeta,
      reply: m.reply.bind(m),
      react: m.react.bind(m),
      download: m.download.bind(m),
    };

    const exec = command.execute || command.function;
    if (typeof exec !== "function") return;
    try {
      await exec(sock, m, context, args);
    } catch (err) {
      console.error("[handler] command failed:", cmdName, err.message);
      await m.reply("ᴄᴏᴍᴍᴀɴᴅ ғᴀɪʟᴇᴅ: " + err.message);
    }
  } catch (err) {
    console.error("[handler] unhandled:", err.message);
  }
}

handler.sms = sms;
handler.unwrapMessage = unwrapMessage;

module.exports = handler;
