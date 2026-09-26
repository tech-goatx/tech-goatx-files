const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "welcome",
    desc: "toggle welcome messages",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "🎉",
    usage: ".welcome on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply("ᴜsᴇ: .welcome on/off\nᴄᴜʀʀᴇɴᴛ: " + flagText(data.welcome));
        return;
      }
      setFlag(context, "welcome", next);
      await m.reply("ᴡᴇʟᴄᴏᴍᴇ: " + flagText(next));
    } catch (err) {
      await m.reply("ᴡᴇʟᴄᴏᴍᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
