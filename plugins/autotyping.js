const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "autotyping",
    alias: ["typing"],
    desc: "toggle auto typing presence",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "⌨️",
    usage: ".autotyping on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply("ᴜsᴇ: .autotyping on/off\nᴄᴜʀʀᴇɴᴛ: " + flagText(data.autoTyping));
        return;
      }
      setFlag(context, "autoTyping", next);
      await m.reply("ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ: " + flagText(next));
    } catch (err) {
      await m.reply("ᴀᴜᴛᴏᴛʏᴘɪɴɢ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
