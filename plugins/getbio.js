const { cmd } = require("../command");
const { extractTarget } = require("../lib/cmdutil");

cmd(
  {
    pattern: "getbio",
    alias: ["about"],
    desc: "get a user bio",
    category: "tools",
    filename: __filename,
    react: "📄",
    usage: ".getbio @user | reply",
  },
  async (sock, m, context) => {
    try {
      const target = extractTarget(m, context.args) || m.sender;
      const status = await sock.fetchStatus(target);
      const text = (status && (status.status || status)) || "ɴᴏ ʙɪᴏ";
      await m.reply(String(text));
    } catch (err) {
      await m.reply("ɢᴇᴛʙɪᴏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
