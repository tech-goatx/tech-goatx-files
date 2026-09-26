const master = require("./isMaster");
const owner = require("./isOwner");
const sudo = require("./isSudo");
const admin = require("./isAdmin");
const normal = require("./isNormal");

const ROLE_HIERARCHY = {
  master: 5,
  owner: 4,
  sudo: 3,
  admin: 2,
  user: 1,
};

const ROLE_EMOJI = {
  master: "M",
  owner: "O",
  sudo: "S",
  admin: "A",
  user: "U",
};

function normalizeRole(role) {
  const key = String(role || "user").trim().toLowerCase();
  if (key === "public") return "user";
  if (key === "group") return "admin";
  if (ROLE_HIERARCHY[key]) return key;
  return "user";
}

function getUserRole(roles) {
  if (!roles) return "user";
  if (roles.isMaster) return "master";
  if (roles.isOwner) return "owner";
  if (roles.isSudo) return "sudo";
  if (roles.isAdmin) return "admin";
  return "user";
}

function getUserRoleEmoji(roleOrRoles) {
  const role =
    typeof roleOrRoles === "string"
      ? normalizeRole(roleOrRoles)
      : getUserRole(roleOrRoles);
  return ROLE_EMOJI[role] || ROLE_EMOJI.user;
}

function commandRole(command) {
  return normalizeRole((command && (command.role || command.type)) || "user");
}

function checkPermission(command, mode, roles) {
  try {
    const isMaster = !!(roles && roles.isMaster);
    if (isMaster) return true;

    const cmdRole = commandRole(command);
    if (cmdRole === "master") return false;

    const isOwner = !!(roles && roles.isOwner);
    const isSudo = !!(roles && roles.isSudo);
    const isAdmin = !!(roles && roles.isAdmin);
    const m = String(mode || "public").toLowerCase();

    if (m === "self") {
      if (!isOwner) return false;
    } else if (m === "private") {
      if (!(isOwner || isSudo)) return false;
    }

    if (cmdRole === "owner") return isOwner;
    if (cmdRole === "sudo") return isOwner || isSudo;
    if (cmdRole === "admin") return isOwner || isSudo || isAdmin;
    return true;
  } catch (err) {
    console.error("[permissions] checkPermission failed:", err.message);
    return false;
  }
}

module.exports = {
  ROLE_HIERARCHY,
  ROLE_EMOJI,
  checkPermission,
  getUserRole,
  getUserRoleEmoji,
  commandRole,
  normalizeRole,
  master,
  owner,
  sudo,
  admin,
  normal,
};
