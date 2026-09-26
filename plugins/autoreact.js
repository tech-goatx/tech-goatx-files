const { cmd } = require("../command");
const { parseOnOff, flagText, currentData, setFlag } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "autoreact",
    alias: ["areact"],
    desc: "toggle auto react",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "💀",
    usage: ".autoreact on|off",
  },
  async (sock, m, context) => {
    try {
      const arg = context.args && context.args[0];
      const parsed = parseOnOff(arg);
      if (parsed === null && arg) {
        await m.reply("ᴜsᴇ: .autoreact on|off");
        return;
      }
      if (parsed === null) {
        const data = currentData(context);
        await m.reply("ᴀᴜᴛᴏʀᴇᴀᴄᴛ: " + flagText(data.autoReact));
        return;
      }
      setFlag(context, "autoReact", parsed);
      await m.reply("ᴀᴜᴛᴏʀᴇᴀᴄᴛ: " + flagText(parsed));
    } catch (err) {
      await m.reply("ᴀᴜᴛᴏʀᴇᴀᴄᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
