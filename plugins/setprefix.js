const { cmd } = require("../command");
const botStore = require("../lib/botStore");

cmd(
  {
    pattern: "setprefix",
    alias: ["prefix"],
    desc: "change command prefix",
    category: "owner",
    role: "owner",
    filename: __filename,
    react: "🔧",
    usage: ".setprefix .",
  },
  async (sock, m, context) => {
    try {
      const next = String((context.args && context.args[0]) || "").trim();
      if (!next || next.length > 3) {
        await m.reply("ᴜsᴇ: .setprefix .\n1-3 ᴄʜᴀʀs");
        return;
      }
      botStore.update(context.session, { prefix: next });
      await m.reply("ᴘʀᴇғɪx ᴀʙ: " + next);
    } catch (err) {
      await m.reply("sᴇᴛᴘʀᴇғɪx ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
