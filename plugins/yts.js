const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "yts",
    alias: ["ytsearch"],
    desc: "youtube search",
    category: "search",
    filename: __filename,
    react: "🔎",
    usage: ".yts query",
  },
  async (sock, m, context) => {
    try {
      const q = String((context && context.text) || "").trim();
      if (!q) {
        await m.reply("ᴜsᴇ: .yts <query>");
        return;
      }
      const url =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(q) +
        "&sp=EgIQAQ%3D%3D";
      const { data } = await axios.get(url, {
        timeout: 20000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        },
      });
      const html = String(data);
      const ids = [];
      const re = /"videoId":"([A-Za-z0-9_-]{11})"/g;
      let match;
      while ((match = re.exec(html)) && ids.length < 8) {
        if (ids.indexOf(match[1]) < 0) ids.push(match[1]);
      }
      const titles = [];
      const tre = /"title":\{"runs":\[\{"text":"([^"]+)"\}\]/g;
      while ((match = tre.exec(html)) && titles.length < 8) {
        titles.push(match[1]);
      }
      if (!ids.length) {
        await m.reply("ɴᴏ ʀᴇsᴜʟᴛs");
        return;
      }
      let text = "ʏᴛ sᴇᴀʀᴄʜ:\n\n";
      ids.forEach((id, i) => {
        text +=
          (i + 1) +
          ". " +
          (titles[i] || id) +
          "\nhttps://www.youtube.com/watch?v=" +
          id +
          "\n\n";
      });
      await m.reply(text.trim());
    } catch (err) {
      await m.reply("ʏᴛs ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
