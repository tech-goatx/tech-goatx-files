const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "goodbye",
    desc: "toggle goodbye messages",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "👋",
    usage: ".goodbye on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply("ᴜsᴇ: .goodbye on/off\nᴄᴜʀʀᴇɴᴛ: " + flagText(data.goodbye));
        return;
      }
      setFlag(context, "goodbye", next);
      await m.reply("ɢᴏᴏᴅʙʏᴇ: " + flagText(next));
    } catch (err) {
      await m.reply("ɢᴏᴏᴅʙʏᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
