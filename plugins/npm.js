const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "npm",
    desc: "search npm package",
    category: "tools",
    filename: __filename,
    react: "📦",
    usage: ".npm express",
  },
  async (sock, m, context) => {
    try {
      const name = String((context && context.text) || "").trim();
      if (!name) {
        await m.reply("ᴜsᴇ: .npm <package>");
        return;
      }
      const res = await axios.get(
        "https://registry.npmjs.org/" + encodeURIComponent(name),
        { timeout: 15000 }
      );
      const data = res.data || {};
      const latest = data["dist-tags"] && data["dist-tags"].latest;
      const text =
        "ᴘᴋɢ: " +
        name +
        "\nᴠᴇʀ: " +
        (latest || "-") +
        "\nᴅᴇsᴄ: " +
        (data.description || "-") +
        "\nʟɪᴄᴇɴsᴇ: " +
        (data.license || "-") +
        "\nhttps://www.npmjs.com/package/" +
        encodeURIComponent(name);
      await m.reply(text);
    } catch (err) {
      await m.reply("ɴᴘᴍ ғᴀɪʟᴇᴅ: " + (err.response && err.response.status === 404 ? "ɴᴏᴛ ғᴏᴜɴᴅ" : err.message));
    }
  }
);
