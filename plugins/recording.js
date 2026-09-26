const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "recording",
    alias: ["autorecording"],
    desc: "toggle auto recording presence",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "🎙️",
    usage: ".recording on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply(
          "ᴜsᴇ: .recording on/off\nᴄᴜʀʀᴇɴᴛ: " + flagText(data.autoRecording)
        );
        return;
      }
      setFlag(context, "autoRecording", next);
      await m.reply("ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ: " + flagText(next));
    } catch (err) {
      await m.reply("ʀᴇᴄᴏʀᴅɪɴɢ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
