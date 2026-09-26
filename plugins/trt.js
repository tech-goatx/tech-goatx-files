const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "trt",
    alias: ["translate"],
    desc: "translate text",
    category: "tools",
    filename: __filename,
    react: "🌍",
    usage: ".trt <lang> <text>",
  },
  async (sock, m, context) => {
    try {
      const args = (context && context.args) || [];
      if (args.length < 2) {
        await m.reply("ᴜsᴇ: .trt <lang> <text>\nᴇx: .trt ur hello");
        return;
      }
      const lang = args[0];
      const text = args.slice(1).join(" ");
      const url =
        "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(text) +
        "&langpair=en|" +
        encodeURIComponent(lang);
      const res = await axios.get(url, { timeout: 15000 });
      const out =
        res.data && res.data.responseData && res.data.responseData.translatedText;
      if (!out) {
        await m.reply("ᴛʀᴀɴsʟᴀᴛᴇ ғᴀɪʟᴇᴅ");
        return;
      }
      await m.reply("ᴏʀɪɢɪɴᴀʟ: " + text + "\nᴛʀᴀɴsʟᴀᴛᴇᴅ: " + out + "\nʟᴀɴɢ: " + lang.toUpperCase());
    } catch (err) {
      await m.reply("ᴛʀᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
