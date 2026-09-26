const { cmd } = require("../command");
const botStore = require("../lib/botStore");
const { formatNumberLine } = require("../lib/cmdutil");

cmd(
  {
    pattern: "listsudo",
    alias: ["sudolist"],
    desc: "list sudo users",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "👑",
  },
  async (sock, m, context) => {
    try {
      const data = botStore.load(context.session);
      const list = (data.sudo || []).map(formatNumberLine).filter(Boolean);
      await m.reply(list.length ? "sᴜᴅᴏ:\n" + list.join("\n") : "sᴜᴅᴏ ʟɪsᴛ ᴋʜᴀʟɪ");
    } catch (err) {
      await m.reply("ʟɪsᴛsᴜᴅᴏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
