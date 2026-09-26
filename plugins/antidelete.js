const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "antidelete",
    alias: ["antidel", "delblock"],
    desc: "toggle anti-delete messages",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "🗑️",
    usage: ".antidelete on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply(
          "ᴜsᴇ: .antidelete on/off\nᴄᴜʀʀᴇɴᴛ: " +
            flagText(data.antiDelete) +
            "\nᴘᴀᴛʜ: " +
            (data.antiDeletePath || "same")
        );
        return;
      }
      setFlag(context, "antiDelete", next);
      await m.reply("ᴀɴᴛɪᴅᴇʟᴇᴛᴇ: " + flagText(next));
    } catch (err) {
      await m.reply("ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
