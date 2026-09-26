const { getSettings } = require("./getSettings");
const { delay } = require("./function");

async function setBio(sock, text) {
  try {
    if (!sock || typeof sock.updateProfileStatus !== "function") return false;
    await sock.updateProfileStatus(String(text).slice(0, 139));
    return true;
  } catch (err) {
    console.error("[bio] setBio failed:", err.message);
    return false;
  }
}

function buildBioText(session) {
  const settings = getSettings();
  const name = settings.botName || "";
  const prefix = settings.prefix || "";
  const version = settings.version || "";
  const phone = (session && session.phoneNumber) || "";
  const uptime = Math.floor(process.uptime());
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  if (phone) {
    return name + " | " + prefix + "menu | paired " + phone + " | v" + version;
  }
  return name + " | " + prefix + "menu | up " + h + "h " + m + "m | v" + version;
}

async function updatePairedBio(sock, session) {
  try {
    const text = buildBioText(session);
    return await setBio(sock, text);
  } catch (err) {
    console.error("[bio] updatePairedBio failed:", err.message);
    return false;
  }
}

async function autoBio(sock, session) {
  try {
    await setBio(sock, buildBioText(session));
  } catch (err) {
    console.error("[bio] autoBio failed:", err.message);
  }
}

function startBioLoop(sock, session, intervalMs) {
  const ms = Number(intervalMs) || 5 * 60 * 1000;
  updatePairedBio(sock, session);
  const timer = setInterval(() => {
    autoBio(sock, session).catch((err) => {
      console.error("[bio] loop failed:", err.message);
    });
  }, ms);
  if (timer.unref) timer.unref();
  return timer;
}

module.exports = {
  setBio,
  autoBio,
  updatePairedBio,
  startBioLoop,
  buildBioText,
  delay,
};
