const { cmd } = require("../command");
const { requireGroupAdmin } = require("../lib/cmdutil");

cmd(
  {
    pattern: "poll",
    alias: ["vote", "survey"],
    desc: "create a group poll",
    category: "group",
    filename: __filename,
    role: "admin",
    react: "📊",
    usage: ".poll Question;Opt1,Opt2,Opt3",
  },
  async (sock, m, context) => {
    try {
      const meta = await requireGroupAdmin(sock, m, context);
      if (!meta) return;
      const q = String((context && context.text) || "").trim();
      if (!q || q.indexOf(";") < 0) {
        await m.reply("ᴜsᴇ: .poll Question;Opt1,Opt2,Opt3");
        return;
      }
      const parts = q.split(";");
      const question = parts[0].trim();
      const options = (parts[1] || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (!question || options.length < 2) {
        await m.reply("ᴀᴛ ʟᴇᴀsᴛ 2 ᴏᴘᴛɪᴏɴs");
        return;
      }
      await sock.sendMessage(m.chat, {
        poll: {
          name: question,
          values: options.slice(0, 12),
          selectableCount: 1,
        },
      });
    } catch (err) {
      await m.reply("ᴘᴏʟʟ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
