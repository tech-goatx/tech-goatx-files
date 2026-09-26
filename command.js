const commands = [];

const DEFAULTS = {
  category: "main",
  react: "✅",
  type: "public",
  role: "user",
  on: "body",
  secret: false,
  fromMe: false,
  dontAddCommandList: false,
  desc: "",
  filename: "Unknown",
  usage: "",
};

function toArray(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean);
  }
  return String(value)
    .split(/[\s,|]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function cmd(info, func) {
  if (!info || typeof info !== "object") {
    throw new TypeError("cmd: first argument must be a command info object");
  }
  if (typeof func !== "function") {
    throw new TypeError("cmd: second argument must be a handler function");
  }

  const data = Object.assign({}, DEFAULTS, info);
  data.pattern = toArray(info.pattern);
  data.alias = toArray(info.alias);

  if (!data.pattern.length) {
    throw new Error("cmd: at least one pattern is required");
  }

  data.execute = func;
  data.function = func;

  commands.push(data);
  console.log(
    "[command] registered:",
    data.pattern.join(", "),
    data.alias.length ? "(aliases: " + data.alias.join(", ") + ")" : ""
  );
  return data;
}

function getCommands() {
  return commands.filter((item) => !item.dontAddCommandList);
}

function findCommand(input) {
  if (!input) return null;
  const name = String(input).trim().toLowerCase();
  if (!name) return null;
  return (
    commands.find((item) => {
      if (item.pattern.includes(name)) return true;
      if (item.alias.includes(name)) return true;
      return false;
    }) || null
  );
}

function getCommandsByCategory(category) {
  const list = getCommands();
  if (!category) return list;
  const key = String(category).trim().toLowerCase();
  return list.filter(
    (item) => String(item.category).trim().toLowerCase() === key
  );
}

module.exports = {
  cmd,
  AddCommand: cmd,
  Function: cmd,
  Module: cmd,
  commands,
  getCommands,
  findCommand,
  getCommandsByCategory,
  DEFAULTS,
};
