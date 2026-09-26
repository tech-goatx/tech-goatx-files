const botStore = require("./botStore");

function parseOnOff(arg) {
  const value = String(arg || "").trim().toLowerCase();
  if (value === "on" || value === "true" || value === "1") return true;
  if (value === "off" || value === "false" || value === "0") return false;
  return null;
}

function flagText(value) {
  return value ? "on" : "off";
}

function currentData(context) {
  return botStore.load(context && context.session);
}

function setFlag(context, key, value) {
  const patch = {};
  patch[key] = value;
  return botStore.update(context && context.session, patch);
}

function setValue(context, key, value) {
  const patch = {};
  patch[key] = value;
  return botStore.update(context && context.session, patch);
}

module.exports = {
  parseOnOff,
  flagText,
  currentData,
  setFlag,
  setValue,
};
