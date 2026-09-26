const { cmd } = require("../command");

cmd(
  {
    pattern: "forward",
    alias: ["frd", "fwd"],
    desc: "forward quoted message to jids",
    category: "owner",
    filename: __filename,
    role: "owner",
    react: "↪️",
    usage: ".forward jid1,jid2 (reply)",
  },
  async (sock, m, context) => {
    try {
      if (!m.quoted || !m.quoted.raw) {
        await m.reply("ʀᴇᴘʟʏ ᴀ ᴍᴇssᴀɢᴇ");
        return;
      }
      const raw = String((context && context.text) || "").trim();
      if (!raw) {
        await m.reply("ᴜsᴇ: .forward jid1,jid2");
        return;
      }
      const jids = raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((jid) => {
          if (jid.includes("@")) return jid;
          if (/^\d{15,}$/.test(jid)) return jid + "@g.us";
          return jid.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        });
      if (!jids.length) {
        await m.reply("ɴᴏ ᴊɪᴅs");
        return;
      }
      for (let i = 0; i < jids.length; i++) {
        await sock.sendMessage(jids[i], { forward: m.quoted.raw });
      }
      await m.reply("ғᴏʀᴡᴀʀᴅᴇᴅ: " + jids.length);
    } catch (err) {
      await m.reply("ғᴏʀᴡᴀʀᴅ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
