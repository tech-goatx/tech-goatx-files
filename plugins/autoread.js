const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "autoread",
    alias: ["readmsg"],
    desc: "toggle auto-read messages",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "👁️",
    usage: ".autoread on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply("ᴜsᴇ: .autoread on/off\nᴄᴜʀʀᴇɴᴛ: " + flagText(data.autoRead));
        return;
      }
      setFlag(context, "autoRead", next);
      await m.reply("ᴀᴜᴛᴏ ʀᴇᴀᴅ: " + flagText(next));
    } catch (err) {
      await m.reply("ᴀᴜᴛᴏʀᴇᴀᴅ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
