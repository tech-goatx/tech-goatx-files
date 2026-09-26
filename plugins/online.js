const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "online",
    alias: ["alwaysonline", "alwayson"],
    desc: "toggle always online status",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "💚",
    usage: ".online on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply("ᴜsᴇ: .online on/off\nᴄᴜʀʀᴇɴᴛ: " + flagText(data.alwaysOnline));
        return;
      }
      setFlag(context, "alwaysOnline", next);
      await m.reply("ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ: " + flagText(next));
    } catch (err) {
      await m.reply("ᴏɴʟɪɴᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
