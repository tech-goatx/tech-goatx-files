const { cmd } = require("../command");

cmd(
  {
    pattern: "rcolor",
    alias: ["randomcolor", "color"],
    desc: "random hex color",
    category: "tools",
    filename: __filename,
    react: "🎨",
  },
  async (sock, m) => {
    try {
      const hex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
      await m.reply(hex);
    } catch (err) {
      await m.reply("ʀᴄᴏʟᴏʀ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
