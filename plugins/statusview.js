const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "statusview",
    alias: ["autoview"],
    desc: "toggle auto view status",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "👁️",
    usage: ".statusview on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply(
          "ᴜsᴇ: .statusview on/off\nᴄᴜʀʀᴇɴᴛ: " + flagText(data.autoStatusSeen)
        );
        return;
      }
      setFlag(context, "autoStatusSeen", next);
      await m.reply("sᴛᴀᴛᴜs ᴠɪᴇᴡ: " + flagText(next));
    } catch (err) {
      await m.reply("sᴛᴀᴛᴜsᴠɪᴇᴡ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
