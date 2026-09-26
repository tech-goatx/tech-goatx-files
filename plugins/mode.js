const { cmd } = require("../command");
const botStore = require("../lib/botStore");
const { getSettings } = require("../lib/getSettings");

cmd(
  {
    pattern: "mode",
    alias: ["worktype"],
    desc: "set bot mode public/private/self",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "⚙️",
  },
  async (sock, m, context) => {
    try {
      const data = botStore.load(context.session);
      const arg = String((context && context.text) || "")
        .trim()
        .toLowerCase();
      if (!arg) {
        await m.reply(
          "ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: " +
            (data.mode || getSettings().mode || "public") +
            "\nᴜsᴇ: .mode public | private | self"
        );
        return;
      }
      if (!["public", "private", "self"].includes(arg)) {
        await m.reply("ᴠᴀʟɪᴅ: public, private, self");
        return;
      }
      botStore.update(context.session, { mode: arg });
      await m.reply("ᴍᴏᴅᴇ sᴇᴛ: " + arg);
    } catch (err) {
      await m.reply("ᴍᴏᴅᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
