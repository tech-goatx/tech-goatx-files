const { cmd } = require("../../command");
const botStore = require("../../lib/botStore");
const { runtime } = require("../../lib/function");

cmd(
  {
    pattern: "test",
    alias: ["mastertest"],
    desc: "master-only bot check",
    category: "master",
    role: "master",
    filename: __filename,
    react: "🧪",
    dontAddCommandList: true,
  },
  async (sock, m, context) => {
    try {
      const data = botStore.load(context.session);
      if (!context.isMaster) {
        return;
      }
      const me = sock.user ? sock.user.id : "";
      const text =
        "ᴍᴀsᴛᴇʀ ᴛᴇsᴛ ᴏᴋ\n" +
        "ʙᴏᴛ: " +
        (global.settings && global.settings.botName ? global.settings.botName : "") +
        "\n" +
        "ᴍᴏᴅᴇ: " +
        (data.mode || "") +
        "\n" +
        "ᴘʀᴇғɪx: " +
        (data.prefix || context.prefix || "") +
        "\n" +
        "sᴜᴅᴏ: " +
        ((data.sudo && data.sudo.length) || 0) +
        "\n" +
        "ᴜᴘᴛɪᴍᴇ: " +
        runtime(process.uptime()) +
        "\n" +
        "sᴇssɪᴏɴ: " +
        ((context.session && context.session.phoneNumber) || "") +
        "\n" +
        "ᴄʜᴀᴛ: " +
        (m.chat || "") +
        "\n" +
        "sᴇɴᴅᴇʀ: " +
        (m.sender || "") +
        "\n" +
        "ʙᴏᴛᴊɪᴅ: " +
        me;
      await m.reply(text);
    } catch (err) {
      console.error("[test] failed:", err.message);
      await m.reply("ᴛᴇsᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
