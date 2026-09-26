const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "adminaction",
    alias: ["adminnotify"],
    desc: "toggle promote/demote notifications",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "👑",
    usage: ".adminaction on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply(
          "ᴜsᴇ: .adminaction on/off\nᴄᴜʀʀᴇɴᴛ: " + flagText(data.adminAction)
        );
        return;
      }
      setFlag(context, "adminAction", next);
      await m.reply("ᴀᴅᴍɪɴ ᴀᴄᴛɪᴏɴ: " + flagText(next));
    } catch (err) {
      await m.reply("ᴀᴅᴍɪɴᴀᴄᴛɪᴏɴ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
