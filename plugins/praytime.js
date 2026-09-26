const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "praytime",
    alias: ["prayertimes", "prayertime", "ptime"],
    desc: "prayer times for a city",
    category: "tools",
    filename: __filename,
    react: "🕌",
    usage: ".praytime lahore",
  },
  async (sock, m, context) => {
    try {
      const city = String((context && context.text) || "").trim() || "lahore";
      const url =
        "https://api.aladhan.com/v1/timingsByCity?city=" +
        encodeURIComponent(city) +
        "&country=&method=2";
      const { data } = await axios.get(url, { timeout: 15000 });
      const t = data && data.data && data.data.timings;
      if (!t) {
        await m.reply("ɴᴏ ᴛɪᴍᴇs");
        return;
      }
      const text =
        "ᴘʀᴀʏᴛɪᴍᴇ: " +
        city +
        "\nғᴀᴊʀ: " +
        t.Fajr +
        "\nᴅʜᴜʜʀ: " +
        t.Dhuhr +
        "\nᴀsʀ: " +
        t.Asr +
        "\nᴍᴀɢʜʀɪʙ: " +
        t.Maghrib +
        "\nɪsʜᴀ: " +
        t.Isha;
      await m.reply(text);
    } catch (err) {
      await m.reply("ᴘʀᴀʏᴛɪᴍᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
