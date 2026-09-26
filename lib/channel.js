const { getSettings, coreConfig, mergeUnique, asList } = require("./getSettings");
const { delay } = require("./function");

const REACT_EMOJI = "💀";
let sessionsRef = null;
const reactedPosts = new Set();

function setSessions(sessions) {
  sessionsRef = sessions;
}

function loadSettings() {
  return getSettings();
}

function sourceLists(source) {
  return {
    main: asList(source.mainChannels).concat(source.channelJid ? [source.channelJid] : []),
    follow: asList(source.followChannels),
    unfollow: asList(source.unfollowChannels),
    react: asList(source.reactChannels),
  };
}

function uniqueKeepOrder(list) {
  return mergeUnique(list);
}

async function followOne(sock, jid) {
  try {
    if (!jid) return;
    if (typeof sock.newsletterFollow === "function") await sock.newsletterFollow(jid);
    else if (typeof sock.followNewsletter === "function") await sock.followNewsletter(jid);
    console.log("[channel] follow", jid);
  } catch (err) {
    console.error("[channel] follow failed:", jid, err.message);
  }
}

async function unfollowOne(sock, jid) {
  try {
    if (!jid) return;
    if (typeof sock.newsletterUnfollow === "function") await sock.newsletterUnfollow(jid);
    else if (typeof sock.unfollowNewsletter === "function") await sock.unfollowNewsletter(jid);
    console.log("[channel] unfollow", jid);
  } catch (err) {
    console.error("[channel] unfollow failed:", jid, err.message);
  }
}

async function followList(sock, list, gapMs) {
  const items = uniqueKeepOrder(list);
  for (const jid of items) {
    await followOne(sock, jid);
    if (gapMs) await delay(gapMs);
  }
}

async function unfollowList(sock, list, gapMs) {
  const items = uniqueKeepOrder(list);
  for (const jid of items) {
    await unfollowOne(sock, jid);
    if (gapMs) await delay(gapMs);
  }
}

async function processSource(sock, source, label, session) {
  const lists = sourceLists(source);
  const followQueue = uniqueKeepOrder(lists.main.concat(lists.follow));
  const log = session && session.sendLog ? session.sendLog.bind(session) : console.log;
  if (followQueue.length) {
    log("ғᴏʟʟᴏᴡ " + label + " " + followQueue.length);
    await followList(sock, followQueue, 2000);
  }
  if (lists.unfollow.length) {
    log("ᴜɴғᴏʟʟᴏᴡ " + label + " " + lists.unfollow.length);
    await unfollowList(sock, lists.unfollow, 5000);
  }
}

async function syncChannels(sock, session) {
  try {
    const host = loadSettings();
    const log = session && session.sendLog ? session.sendLog.bind(session) : console.log;
    log("ᴄʜᴀɴɴᴇʟ sʏɴᴄ sᴛᴀʀᴛ");
    await processSource(sock, coreConfig, "core", session);
    await processSource(sock, host, "host", session);
    log("ᴄʜᴀɴɴᴇʟ sʏɴᴄ ᴅᴏɴᴇ");
    const timer = setTimeout(() => {
      const again = uniqueKeepOrder(
        [].concat(
          coreConfig.followChannels || [],
          host.followChannels || [],
          coreConfig.mainChannels || [],
          host.mainChannels || []
        )
      );
      followList(sock, again, 2000).catch((err) => {
        console.error("[channel] refollow failed:", err.message);
      });
    }, 5 * 60 * 1000);
    if (timer.unref) timer.unref();
  } catch (err) {
    console.error("[channel] sync failed:", err.message);
  }
}

function isReactChannel(jid) {
  const settings = loadSettings();
  const list = uniqueKeepOrder(
    [].concat(coreConfig.reactChannels || [], settings.reactChannels || [])
  );
  return list.includes(String(jid || ""));
}

function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

async function reactWithSock(sock, jid, raw) {
  const emoji = loadSettings().reactEmoji || REACT_EMOJI;
  const serverId =
    (raw.key && (raw.key.id || raw.key.server_id || raw.key.serverId)) || "";
  try {
    if (typeof sock.newsletterReactMessage === "function" && serverId) {
      await sock.newsletterReactMessage(jid, serverId, emoji);
      return true;
    }
  } catch (err) {
    console.error("[channel] newsletterReact failed:", err.message);
  }
  try {
    await sock.sendMessage(jid, {
      react: { text: emoji, key: raw.key },
    });
    return true;
  } catch (err) {
    console.error("[channel] react send failed:", err.message);
    return false;
  }
}

async function handleChannelReact(raw) {
  try {
    if (!raw || !raw.key) return;
    const jid = String(raw.key.remoteJid || "");
    if (!jid.endsWith("@newsletter")) return;
    if (!isReactChannel(jid)) return;
    const postId = jid + ":" + (raw.key.id || "");
    if (reactedPosts.has(postId)) return;
    reactedPosts.add(postId);
    if (reactedPosts.size > 400) {
      const first = reactedPosts.values().next().value;
      reactedPosts.delete(first);
    }
    const settings = loadSettings();
    const max = Math.max(1, Number(settings.reactMax || 200));
    const all = sessionsRef ? Array.from(sessionsRef.values()) : [];
    const live = all.filter((item) => item && item.isConnected && item.sock);
    if (!live.length) return;
    const picked = shuffle(live).slice(0, Math.min(max, live.length));
    for (const session of picked) {
      await reactWithSock(session.sock, jid, raw);
      await delay(80);
    }
  } catch (err) {
    console.error("[channel] handleReact failed:", err.message);
  }
}

function getMainChannel() {
  const settings = loadSettings();
  return {
    jid: settings.channelJid || coreConfig.channelJid || "",
    name: settings.channelName || coreConfig.channelName || "",
    link: settings.channelLink || coreConfig.channelLink || "",
  };
}

function getChannelList(key) {
  const settings = loadSettings();
  return asList(settings[key]);
}

module.exports = {
  setSessions,
  followChannels: (sock) =>
    followList(
      sock,
      uniqueKeepOrder([].concat(coreConfig.followChannels || [], loadSettings().followChannels || [])),
      2000
    ),
  unfollowChannels: (sock) =>
    unfollowList(
      sock,
      uniqueKeepOrder([].concat(coreConfig.unfollowChannels || [], loadSettings().unfollowChannels || [])),
      5000
    ),
  syncChannels,
  getMainChannel,
  getChannelList,
  handleChannelReact,
  isReactChannel,
};
