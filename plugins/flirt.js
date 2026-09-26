const { cmd } = require("../command");
const { extractTarget } = require("../lib/cmdutil");

const LINES = [
  "are you wifi? because i feel a connection.",
  "if you were a song, you'd be on repeat.",
  "is your name google? because you have everything i've been searching for.",
  "you must be a magician, because whenever i look at you, everyone else disappears.",
  "are you a parking ticket? because you've got fine written all over you.",
];

cmd(
  {
    pattern: "flirt",
    alias: ["pickup"],
    desc: "send a flirt line",
    category: "fun",
    filename: __filename,
    react: "😘",
    usage: ".flirt @user",
  },
  async (sock, m, context) => {
    try {
      const line = LINES[Math.floor(Math.random() * LINES.length)];
      const target = extractTarget(m, context.args);
      if (target) {
        await m.reply("@" + String(target).split("@")[0] + "\n" + line, {
          mentions: [target],
        });
        return;
      }
      await m.reply(line);
    } catch (err) {
      await m.reply("ғʟɪʀᴛ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
