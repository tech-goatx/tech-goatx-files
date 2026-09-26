const { cmd } = require("../command");

const DARES = [
  "send a voice note saying hello in a funny accent.",
  "change your name in this group for 10 minutes.",
  "type with your eyes closed for the next message.",
  "compliment the person above you.",
  "send a random sticker.",
  "say the alphabet backwards.",
  "text this chat a joke without using the letter e.",
];

cmd(
  {
    pattern: "dare",
    desc: "dare challenge",
    category: "fun",
    filename: __filename,
    react: "🔥",
  },
  async (sock, m) => {
    try {
      await m.reply(DARES[Math.floor(Math.random() * DARES.length)]);
    } catch (err) {
      await m.reply("ᴅᴀʀᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
