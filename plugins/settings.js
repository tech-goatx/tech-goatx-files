const { cmd } = require("../command");
const { currentData, flagText } = require("../lib/settingsCmd");

cmd(
  {
    pattern: "settings",
    alias: ["setting", "config"],
    desc: "show bot settings",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "⚙️",
  },
  async (sock, m, context) => {
    try {
      const d = currentData(context);
      const text =
        "sᴇᴛᴛɪɴɢs\n" +
        "ᴍᴏᴅᴇ: " +
        (d.mode || "public") +
        "\n" +
        "ᴘʀᴇғɪx: " +
        (d.prefix || ".") +
        "\n" +
        "ᴡᴇʟᴄᴏᴍᴇ: " +
        flagText(d.welcome) +
        "\n" +
        "ɢᴏᴏᴅʙʏᴇ: " +
        flagText(d.goodbye) +
        "\n" +
        "ᴀɴᴛɪᴅᴇʟ: " +
        flagText(d.antiDelete) +
        "\n" +
        "ᴀɴᴛɪᴇᴅɪᴛ: " +
        flagText(d.antiEdit) +
        "\n" +
        "ᴀɴᴛɪʟɪɴᴋ: " +
        (d.antiLink || "off") +
        "\n" +
        "ᴀɴᴛɪᴄᴀʟʟ: " +
        flagText(d.antiCall) +
        "\n" +
        "ᴏɴʟɪɴᴇ: " +
        flagText(d.alwaysOnline) +
        "\n" +
        "ᴛʏᴘɪɴɢ: " +
        flagText(d.autoTyping) +
        "\n" +
        "ʀᴇᴄᴏʀᴅɪɴɢ: " +
        flagText(d.autoRecording) +
        "\n" +
        "ᴀᴜᴛᴏʀᴇᴀᴅ: " +
        flagText(d.autoRead) +
        "\n" +
        "sᴛᴀᴛᴜsᴠɪᴇᴡ: " +
        flagText(d.autoStatusSeen) +
        "\n" +
        "ᴀᴜᴛᴏʀᴇᴀᴄᴛ: " +
        flagText(d.autoReact);
      await m.reply(text);
    } catch (err) {
      await m.reply("sᴇᴛᴛɪɴɢs ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
