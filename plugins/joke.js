const { cmd } = require("../command");

const JOKES = [
  "why do programmers prefer dark mode? because light attracts bugs.",
  "a sql query walks into a bar, walks up to two tables and asks: can i join you?",
  "there are 10 types of people: those who understand binary and those who don't.",
  "i would tell you a udp joke, but you might not get it.",
  "why did the developer go broke? because he used up all his cache.",
  "git commit -m 'fixed bugs' ... introduced 3 more.",
  "my code doesn't work, i have no idea why. my code works, i have no idea why.",
];

cmd(
  {
    pattern: "joke",
    alias: ["jokes"],
    desc: "send a random joke",
    category: "fun",
    filename: __filename,
    react: "😂",
  },
  async (sock, m) => {
    try {
      await m.reply(JOKES[Math.floor(Math.random() * JOKES.length)]);
    } catch (err) {
      await m.reply("ᴊᴏᴋᴇ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
