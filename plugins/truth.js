const { cmd } = require("../command");

const TRUTHS = [
  "what is your most embarrassing memory?",
  "who was your first crush?",
  "what secret have you never told anyone?",
  "what is the last lie you told?",
  "who in this chat do you trust most?",
  "what is your biggest fear?",
  "what habit do you want to break?",
];

cmd(
  {
    pattern: "truth",
    desc: "truth question",
    category: "fun",
    filename: __filename,
    react: "🗣️",
  },
  async (sock, m) => {
    try {
      await m.reply(TRUTHS[Math.floor(Math.random() * TRUTHS.length)]);
    } catch (err) {
      await m.reply("ᴛʀᴜᴛʜ ғᴀɪʟᴇᴅ: " + err.message);
    }
  }
);
