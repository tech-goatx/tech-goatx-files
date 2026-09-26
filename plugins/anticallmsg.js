const { cmd } = require("../command");
const { currentData, setValue } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "anticallmsg",
    alias: ["callmsg", "rejectmsg"],
    desc: "set anti-call reject message",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "📝",
    usage: ".anticallmsg <message>",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const text = String((context && context.text) || "").trim();
      if (!text) {
        await m.reply(
          "ᴄᴜʀʀᴇɴᴛ:\n" +
            (data.rejectMsg || "calls not allowed on this number") +
            "\n\nᴜsᴇ: .anticallmsg <message>"
        );
        return;
      }
      setValue(context, "rejectMsg", text);
      await m.reply("ʀᴇᴊᴇᴄᴛ ᴍsɢ:\n" + text);
    } catch (err) {
      await m.reply("ᴀɴᴛɪᴄᴀʟʟᴍsɢ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
