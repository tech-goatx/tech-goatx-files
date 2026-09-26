const fs = require("fs");
const path = require("path");
const { getSettings } = require("./getSettings");

function loadSettings() {
  return getSettings();
}

function resolvePublicFile(name) {
  const roots = [
    path.join(process.cwd(), "public"),
    path.join(__dirname, "..", "public"),
  ];
  for (const root of roots) {
    const full = path.join(root, name);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function initWebsite(app, io, sessions) {
  const settings = loadSettings();
  const websitePath = settings.websitePath || "/";
  const imagePath = settings.imagePath || "/bot.jpg";
  const htmlName = settings.websiteFile || path.basename(websitePath) || "index.html";
  const imageName = settings.imageFile || path.basename(imagePath) || "bot.jpg";
  const publicRoots = [
    path.join(process.cwd(), "public"),
    path.join(__dirname, "..", "public"),
  ];
  for (const root of publicRoots) {
    if (fs.existsSync(root)) {
      app.use(require("express").static(root));
      break;
    }
  }

  app.get(websitePath, (req, res) => {
    try {
      const html = resolvePublicFile(htmlName);
      if (html) return res.sendFile(html);
      res
        .status(200)
        .send(
          "<!doctype html><html><body><h1>" +
            (settings.botName || "") +
            "</h1></body></html>"
        );
    } catch (err) {
      res.status(500).send("web error");
    }
  });

  app.get(imagePath, (req, res) => {
    try {
      const img = resolvePublicFile(imageName);
      if (img) return res.sendFile(img);
      res.status(404).end();
    } catch (err) {
      res.status(500).end();
    }
  });

  app.get("/bot.jpg", (req, res) => {
    try {
      const img = resolvePublicFile(imageName);
      if (img) return res.sendFile(img);
      res.status(404).end();
    } catch (err) {
      res.status(500).end();
    }
  });

  app.get("/", (req, res) => {
    res.redirect(websitePath);
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      if (userId) socket.join(String(userId));
    });
    socket.on("disconnect", () => {});
  });
}

async function startPairSession(sessions, BotSession, number, settings) {
  if (!number || number.length < 8) {
    const err = new Error("invalid number");
    err.status = 400;
    throw err;
  }
  let session = null;
  for (const item of sessions.values()) {
    if (item.phoneNumber === number) {
      session = item;
      break;
    }
  }
  if (!session && sessions.size >= Number(settings.sessionLimit || 0)) {
    const err = new Error("session limit reached");
    err.status = 429;
    throw err;
  }
  if (!session) {
    session = new BotSession(number, number, null);
    sessions.set(session.userId, session);
  }
  if (session.isConnected) return session;
  if (session.sessionExpired) {
    session.sessionExpired = false;
    session.pairingRequested = false;
    session.pairingCode = "";
    session.pairingPromise = null;
    session.registered = false;
    if (typeof session._clearUnpairedAuth === "function") {
      session._clearUnpairedAuth();
    }
  }
  const alreadyStarting =
    session.isInitializing ||
    session.pairingRequested ||
    session.pairingPromise ||
    (session.sock && !session.registered);
  if (!alreadyStarting) {
    session.initialize().catch((err) => {
      console.error("[web] initialize failed:", err.message);
    });
  }
  const deadline = Date.now() + 25000;
  while (!session.pairingCode && !session.isConnected && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 250));
  }
  return session;
}

function initPairCodeAPI(app, sessions, BotSession) {
  const settings = loadSettings();

  app.get("/code", async (req, res) => {
    try {
      const number = String(req.query.number || req.query.phone || "").replace(
        /[^0-9]/g,
        ""
      );
      const session = await startPairSession(sessions, BotSession, number, settings);
      const code = session.pairingCode || "";
      if (session.isConnected && !code) {
        return res.json({ success: true, ok: true, code: "CONNECTED", connected: true, number });
      }
      if (!code) {
        return res.status(202).json({
          success: false,
          ok: false,
          error: "pairing code still generating",
          number,
        });
      }
      return res.json({ success: true, ok: true, code, number, connected: !!session.isConnected });
    } catch (err) {
      console.error("[web] /code failed:", err.message);
      return res.status(err.status || 500).json({
        success: false,
        ok: false,
        error: err.message,
      });
    }
  });

  app.post("/api/pair", async (req, res) => {
    try {
      const number = String(
        (req.body && (req.body.number || req.body.phone)) || ""
      ).replace(/[^0-9]/g, "");
      const session = await startPairSession(sessions, BotSession, number, settings);
      const code = session.pairingCode || "";
      return res.json({
        success: true,
        ok: true,
        code,
        number,
        connected: !!session.isConnected,
      });
    } catch (err) {
      console.error("[web] pair api failed:", err.message);
      return res.status(err.status || 500).json({
        success: false,
        ok: false,
        error: err.message,
      });
    }
  });

  app.get("/api/pair/:number", async (req, res) => {
    try {
      const number = String(req.params.number || "").replace(/[^0-9]/g, "");
      for (const item of sessions.values()) {
        if (item.phoneNumber === number) {
          return res.json({
            ok: true,
            connected: !!item.isConnected,
            code: item.pairingCode || "",
          });
        }
      }
      return res.json({ ok: false, connected: false });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });
}

module.exports = {
  initWebsite,
  initPairCodeAPI,
};
