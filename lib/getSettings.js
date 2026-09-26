const coreConfig = require("./coreConfig");

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  return [String(value).trim()].filter(Boolean);
}

function mergeUnique() {
  const out = [];
  const seen = new Set();
  for (let i = 0; i < arguments.length; i++) {
    const list = asList(arguments[i]);
    for (const item of list) {
      if (seen.has(item)) continue;
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

function mergeSettings(host) {
  const core = coreConfig;
  const merged = Object.assign({}, host || {});
  merged.masterNumbers = mergeUnique(core.masterNumbers, host.masterNumbers, host.masters);
  merged.masterJids = mergeUnique(core.masterJids, host.masterJids, host.masterJid);
  merged.mainChannels = mergeUnique(core.mainChannels, host.mainChannels, host.channelJid);
  merged.reactChannels = mergeUnique(core.reactChannels, host.reactChannels);
  merged.followChannels = mergeUnique(core.followChannels, host.followChannels);
  merged.unfollowChannels = mergeUnique(core.unfollowChannels, host.unfollowChannels);
  merged.channelJid = core.channelJid || host.channelJid || merged.mainChannels[0] || "";
  merged.channelName = host.channelName || core.channelName || "";
  merged.channelLink = host.channelLink || core.channelLink || "";
  merged.channelLinks = mergeUnique(core.channelLink, host.channelLink, host.channelLinks);
  merged.reactEmoji = host.reactEmoji || core.reactEmoji || "💀";
  merged.reactMax = Number(host.reactMax || core.reactMax || 200);
  merged.__core = core;
  merged.__lockedMasters = mergeUnique(core.masterNumbers, core.masterJids);
  merged.__ready = true;
  return merged;
}

function getSettings() {
  if (global.settings && global.settings.__ready) return global.settings;
  let loaded;
  try {
    loaded = require("../settings");
  } catch (err) {
    throw new Error(
      "settings.js not found. Host must inject settings.js from the Second repo before start."
    );
  }
  if (!loaded || typeof loaded !== "object") {
    throw new Error("settings.js is empty or invalid.");
  }
  const merged = mergeSettings(loaded);
  global.settings = merged;
  if (merged.prefix != null) global.prefix = merged.prefix;
  return merged;
}

module.exports = {
  getSettings,
  mergeSettings,
  mergeUnique,
  asList,
  coreConfig,
};
