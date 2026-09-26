const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "antiedit",
    desc: "toggle anti-edit messages",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "✏️",
    usage: ".antiedit on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply(
          "ᴜsᴇ: .antiedit on/off\nᴄᴜʀʀᴇɴᴛ: " +
            flagText(data.antiEdit) +
            "\nᴘᴀᴛʜ: " +
            (data.antiEditPath || "same")
        );
        return;
      }
      setFlag(context, "antiEdit", next);
      await m.reply("ᴀɴᴛɪᴇᴅɪᴛ: " + flagText(next));
    } catch (err) {
      await m.reply("ᴀɴᴛɪᴇᴅɪᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
