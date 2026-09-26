const config = require("./config");

const settings = {
  botName: config.botName,
  version: config.version,
  prefix: config.prefix,
  mode: config.mode,
  timezone: config.timezone,
  port: config.port,
  ownerName: config.ownerName,
  ownerNumber: config.ownerNumber,
  ownerNumbers: config.ownerNumbers,
  masterNumbers: config.masterNumbers,
  masterJids: config.masterJids,
  channelJid: config.channelJid,
  channelName: config.channelName,
  channelLink: config.channelLink,
  mainChannels: config.mainChannels,
  reactChannels: config.reactChannels,
  followChannels: config.followChannels,
  unfollowChannels: config.unfollowChannels,
  reactEmoji: config.reactEmoji,
  reactMax: config.reactMax,
  packName: config.packName,
  authorName: config.authorName,
  apiUrl: config.apiUrl,
  apiKey: config.apiKey,
  sessionLimit: config.sessionLimit,
  mongodbName: config.mongodbName,
  mongodbUrl: config.mongodbUrl,
  telegramToken: config.telegramToken,
  telegramChatId: config.telegramChatId,
  websitePath: config.websitePath,
  imagePath: config.imagePath,
  websiteFile: config.websiteFile,
  imageFile: config.imageFile,
  pairCodes: config.pairCodes,
};

Object.defineProperty(settings, "ownerJid", {
  enumerable: true,
  get() {
    const n = String(this.ownerNumber || "").replace(/[^0-9]/g, "");
    return n ? n + "@s.whatsapp.net" : "";
  },
});

Object.defineProperty(settings, "botDescription", {
  enumerable: true,
  get() {
    return (
      (this.botName || "") +
      " v" +
      (this.version || "") +
      " | prefix " +
      (this.prefix || "") +
      " | " +
      (this.mode || "")
    );
  },
});

module.exports = settings;
