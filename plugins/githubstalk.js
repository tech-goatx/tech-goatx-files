const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "githubstalk",
    alias: ["gh", "gituser"],
    desc: "github user info",
    category: "tools",
    filename: __filename,
    react: "🖥️",
    usage: ".githubstalk username",
  },
  async (sock, m, context) => {
    try {
      const username = String((context.args && context.args[0]) || "").trim();
      if (!username) {
        await m.reply("ᴜsᴇ: .githubstalk <username>");
        return;
      }
      const { data } = await axios.get(
        "https://api.github.com/users/" + encodeURIComponent(username),
        { timeout: 15000, headers: { "User-Agent": "aman-md" } }
      );
      const text =
        "ᴜsᴇʀ: " +
        (data.name || data.login) +
        "\nᴜʀʟ: " +
        data.html_url +
        "\nʙɪᴏ: " +
        (data.bio || "-") +
        "\nʟᴏᴄ: " +
        (data.location || "-") +
        "\nʀᴇᴘᴏs: " +
        data.public_repos +
        "\nғᴏʟʟᴏᴡᴇʀs: " +
        data.followers +
        "\nfollowing: " +
        data.following;
      if (data.avatar_url) {
        await sock.sendMessage(
          m.chat,
          { image: { url: data.avatar_url }, caption: text },
          { quoted: m.raw }
        );
        return;
      }
      await m.reply(text);
    } catch (err) {
      await m.reply("ɢɪᴛʜᴜʙsᴛᴀʟᴋ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
