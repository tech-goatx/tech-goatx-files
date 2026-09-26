const { cmd } = require("../command");
const { currentData, setValue } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "editpath",
    desc: "set where edited messages are sent",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "📍",
    usage: ".editpath inbox/same",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const value = String((context.args && context.args[0]) || "").toLowerCase();
      if (value !== "inbox" && value !== "same") {
        await m.reply(
          "ᴜsᴇ: .editpath inbox/same\nᴄᴜʀʀᴇɴᴛ: " + (data.antiEditPath || "same")
        );
        return;
      }
      setValue(context, "antiEditPath", value);
      await m.reply("ᴇᴅɪᴛ ᴘᴀᴛʜ: " + value);
    } catch (err) {
      await m.reply("ᴇᴅɪᴛᴘᴀᴛʜ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
