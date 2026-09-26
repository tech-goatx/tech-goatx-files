const { cmd } = require("../command");
const { currentData, setValue } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "antilink",
    alias: ["nolink"],
    desc: "toggle antilink: off | warn | delete | on",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "🔗",
    usage: ".antilink off|warn|delete|on",
  },
  async (sock, m, context) => {
    try {
      if (!m.isGroup) {
        await m.reply("ʏᴇʜ ɢʀᴏᴜᴘ ᴄᴏᴍᴍᴀɴᴅ ʜᴀɪ");
        return;
      }
      const arg = String((context.args && context.args[0]) || "").toLowerCase();
      const data = currentData(context);
      if (!arg) {
        await m.reply("ᴀɴᴛɪʟɪɴᴋ: " + (data.antiLink || "off") + "\nᴜsᴇ: .antilink off|warn|delete|on");
        return;
      }
      const allowed = ["off", "warn", "delete", "on"];
      if (allowed.indexOf(arg) < 0) {
        await m.reply("ᴜsᴇ: .antilink off|warn|delete|on");
        return;
      }
      setValue(context, "antiLink", arg);
      await m.reply("ᴀɴᴛɪʟɪɴᴋ: " + arg);
    } catch (err) {
      await m.reply("ᴀɴᴛɪʟɪɴᴋ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
