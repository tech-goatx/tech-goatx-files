const axios = require("axios");
const { extractTarget } = require("./cmdutil");

async function sendReactGif(sock, m, context, action, apiPath) {
  const target = extractTarget(m, context && context.args);
  const senderTag = "@" + String(m.sender).split("@")[0];
  let caption = senderTag + " " + action;
  const mentions = [m.sender];
  if (target) {
    caption += " @" + String(target).split("@")[0];
    mentions.push(target);
  }
  const { data } = await axios.get("https://api.waifu.pics/sfw/" + apiPath, {
    timeout: 15000,
  });
  const url = data && data.url;
  if (!url) {
    await m.reply(caption, { mentions });
    return;
  }
  await sock.sendMessage(
    m.chat,
    { image: { url }, caption, mentions },
    { quoted: m.raw }
  );
}

module.exports = { sendReactGif };
