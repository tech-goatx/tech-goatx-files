const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "weather",
    alias: ["wthr"],
    desc: "weather for a city",
    category: "tools",
    filename: __filename,
    react: "🌤️",
    usage: ".weather lahore",
  },
  async (sock, m, context) => {
    try {
      const city = String((context && context.text) || "").trim();
      if (!city) {
        await m.reply("ᴜsᴇ: .weather <city>");
        return;
      }
      const { data } = await axios.get(
        "https://wttr.in/" + encodeURIComponent(city) + "?format=j1",
        { timeout: 15000 }
      );
      const cur = data && data.current_condition && data.current_condition[0];
      const area = data && data.nearest_area && data.nearest_area[0];
      if (!cur) {
        await m.reply("ɴᴏ ᴅᴀᴛᴀ");
        return;
      }
      const name =
        (area && area.areaName && area.areaName[0] && area.areaName[0].value) || city;
      const text =
        name +
        "\n" +
        (cur.weatherDesc && cur.weatherDesc[0] && cur.weatherDesc[0].value) +
        "\n" +
        cur.temp_C +
        "°C  ʜᴜᴍ " +
        cur.humidity +
        "%\nᴡɪɴᴅ " +
        cur.windspeedKmph +
        " km/h";
      await m.reply(text);
    } catch (err) {
      await m.reply("ᴡᴇᴀᴛʜᴇʀ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
