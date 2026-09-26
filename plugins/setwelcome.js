const { cmd } = require("../command");
const { currentData, setValue } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "setwelcome",
    desc: "set custom welcome message",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "✏️",
    usage: ".setwelcome @user welcome to @group",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply(
          "ᴄᴜʀʀᴇɴᴛ:\n" +
            (data.welcomeMessage || "default") +
            "\n\nᴜsᴇ: .setwelcome <msg>\n@user @group @desc @count @bot @time"
        );
        return;
      }
      setValue(context, "welcomeMessage", text);
      await m.reply("ᴡᴇʟᴄᴏᴍᴇ ᴍsɢ sᴇᴛ:\n" + text);
    } catch (err) {
      await m.reply("sᴇᴛᴡᴇʟᴄᴏᴍᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
