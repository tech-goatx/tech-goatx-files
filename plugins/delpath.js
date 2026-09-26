const { cmd } = require("../command");
const { currentData, setValue } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "delpath",
    alias: ["antidelpath"],
    desc: "set where deleted messages are sent",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "📍",
    usage: ".delpath inbox/same",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const value = String((context.args && context.args[0]) || "").toLowerCase();
      if (value !== "inbox" && value !== "same") {
        await m.reply(
          "ᴜsᴇ: .delpath inbox/same\nᴄᴜʀʀᴇɴᴛ: " + (data.antiDeletePath || "same")
        );
        return;
      }
      setValue(context, "antiDeletePath", value);
      await m.reply("ᴅᴇʟᴇᴛᴇ ᴘᴀᴛʜ: " + value);
    } catch (err) {
      await m.reply("ᴅᴇʟᴘᴀᴛʜ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
