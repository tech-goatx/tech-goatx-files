const { cmd } = require("../command");
const axios = require("axios");

async function searchYoutube(q) {
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
  return ids.map((id, i) => ({
    id,
    title: titles[i] || id,
    url: "https://www.youtube.com/watch?v=" + id,
  }));
}

cmd(
  {
    pattern: "play",
    alias: ["song", "music", "play2"],
    desc: "download youtube audio",
    category: "download",
    filename: __filename,
    react: "🎵",
    usage: ".play faded alan walker",
  },
  async (sock, m, context) => {
    try {
      const q = String((context && context.text) || "").trim();
      if (!q) {
        await m.reply("ᴜsᴇ: .play <song name>");
        return;
      }
      const results = await searchYoutube(q);
      if (!results.length) {
        await m.reply("ɴᴏ ʀᴇsᴜʟᴛs");
        return;
      }
      const video = results[0];
      const api =
        "https://jawad-tech.vercel.app/download/ytdl?url=" +
        encodeURIComponent(video.url);
      const { data } = await axios.get(api, { timeout: 30000 });
      const audioUrl =
        (data && data.result && (data.result.audio || data.result.url || data.result.mp3)) ||
        (data && (data.audio || data.url));
      if (!audioUrl) {
        await m.reply("ᴀᴜᴅɪᴏ ɴᴏᴛ ғᴏᴜɴᴅ\n" + video.url);
        return;
      }
      await sock.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: (video.title || "audio") + ".mp3",
        },
        { quoted: m.raw }
      );
    } catch (err) {
      await m.reply("ᴘʟᴀʏ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
