const { cmd } = require("../command");
const { currentData, setValue } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "setgoodbye",
    desc: "set custom goodbye message",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "✏️",
    usage: ".setgoodbye @user left @group",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply(
          "ᴄᴜʀʀᴇɴᴛ:\n" +
            (data.goodbyeMessage || "default") +
            "\n\nᴜsᴇ: .setgoodbye <msg>\n@user @group @desc @count @bot @time"
        );
        return;
      }
      setValue(context, "goodbyeMessage", text);
      await m.reply("ɢᴏᴏᴅʙʏᴇ ᴍsɢ sᴇᴛ:\n" + text);
    } catch (err) {
      await m.reply("sᴇᴛɢᴏᴏᴅʙʏᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
