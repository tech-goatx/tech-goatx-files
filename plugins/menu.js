const { cmd, getCommands, getCommandsByCategory, commands } = require("../command");
const { sendNewsletter } = require("../lib/newsletter");
const { toSmallCaps } = require("../lib/fontManager");
const { getSettings } = require("../lib/getSettings");

function loadSettings() {
  return getSettings();
}

cmd(
  {
    pattern: "menu",
    alias: ["help", "h"],
    desc: "list all commands by category",
    category: "main",
    filename: __filename,
    react: "✅",
  },
  async (sock, m, context) => {
    try {
      const settings = loadSettings();
      const prefix = (context && context.prefix) || global.prefix || settings.prefix || "";
      const roleRank = { user: 1, admin: 2, sudo: 3, owner: 4, master: 5 };
      const myRank = roleRank[context.userRole] || 1;
      const visible = getCommands().filter((item) => {
        const need = String(item.role || "user").toLowerCase();
        const rank = roleRank[need] || 1;
        if (context.isMaster) return true;
        return rank <= myRank;
      });
      const cats = {};
      for (const item of visible) {
        const cat = item.category || "main";
        if (!cats[cat]) cats[cat] = [];
        cats[cat].push(item);
      }
      const keys = Object.keys(cats).sort();
      let text =
        toSmallCaps(settings.botName || "") +
        " ᴍᴇɴᴜ\n" +
        "ᴘʀᴇғɪx: " +
        prefix +
        "\n" +
        "ᴏᴡɴᴇʀ: " +
        (settings.ownerName || "") +
        "\n" +
        "ᴛᴏᴛᴀʟ: " +
        visible.length +
        "\n";
      for (const cat of keys) {
        text += "\n*" + toSmallCaps(cat) + "*\n";
        for (const item of cats[cat]) {
          const name = (item.pattern && item.pattern[0]) || "";
          text += prefix + name;
          if (item.desc) text += " - " + item.desc;
          text += "\n";
        }
      }
      const sent = await sendNewsletter(sock, m.chat, text.trim(), m.raw);
      if (!sent) await m.reply(text.trim());
    } catch (err) {
      console.error("[menu] failed:", err.message);
      await m.reply("ᴍᴇɴᴜ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);

module.exports = { getCommandsByCategory, commands };
