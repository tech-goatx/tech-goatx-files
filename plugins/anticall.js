const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "anticall",
    alias: ["antcall", "callblock"],
    desc: "toggle anti-call reject",
    category: "settings",
    filename: __filename,
    role: "owner",
    react: "📵",
    usage: ".anticall on/off",
  },
  async (sock, m, context) => {
    try {
      const data = currentData(context);
      const next = parseOnOff(context.args && context.args[0]);
      if (next == null) {
        await m.reply("ᴜsᴇ: .anticall on/off\nᴄᴜʀʀᴇɴᴛ: " + flagText(data.antiCall));
        return;
      }
      setFlag(context, "antiCall", next);
      await m.reply("ᴀɴᴛɪᴄᴀʟʟ: " + flagText(next));
    } catch (err) {
      await m.reply("ᴀɴᴛɪᴄᴀʟʟ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
