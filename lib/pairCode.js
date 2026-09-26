const CUSTOM_CODES = [
  "4M4NT3CH",
  "AM4NTECH",
  "AMANTECH",
  "4M4NTECH",
  "AMANT3CH",
  "4MANTECH",
  "AM4NT3CH",
  "AMAN4MDX",
  "4M4N4MDX",
  "AMANMDX1",
  "TECHX4MD",
  "AM4NMDX1",
  "4M4NMDX1",
  "AMANBOT1",
  "4M4NBOT1",
  "AMANXBOT",
  "TECHXBOT",
  "AM4NXBOT",
  "4M4NXBOT",
  "AMAN2026",
  "4M4N2026",
  "AM4N2026",
  "TECHX202",
  "AMANMD01",
  "4M4NMD01",
  "AMANMD02",
  "AMANMD03",
  "JARVIS01",
  "JARV1S01",
  "J4RVIS01",
  "AMANHOST",
  "4M4NHOST",
  "AM4NHOST",
  "AMANPAIR",
  "4M4NPAIR",
  "AM4NPAIR",
  "PAIR4MAN",
  "CODE4MAN",
  "AMANCODE",
  "4M4NCODE",
  "AMANLIVE",
  "4M4NLIVE",
  "AMANOK01",
  "AMANOK02",
  "AMANOK03",
  "XAMANMD1",
  "X4M4NMD1",
  "BOTAMAN1",
  "BOT4M4N1",
  "MDAMAN01",
  "MD4M4N01",
  "AMANTECX",
  "4M4NTECX",
  "T3CHX4MD",
  "T3CHAMAN",
  "AMANWHATS",
  "WAAMAN01",
  "WA4M4N01",
  "AMANMDX2",
  "AMANMDX3",
  "AMANMDX4",
  "4M4NMDX2",
  "AM4NMDX2",
  "TECHXMD1",
  "TECHXMD2",
  "AMANXMD1",
  "AMANXMD2",
  "4MANXMD1",
  "AM4NXMD1",
  "JARV1SMD",
  "J4RVISMD",
  "AMANOKAY",
  "4M4NOKAY",
  "AMANBEST",
  "4M4NBEST",
  "AMANPRO1",
  "4M4NPRO1",
  "AMANVIP1",
  "4M4NVIP1",
  "AMANPLUS",
  "4M4NPLUS",
  "XTECH4MD",
  "XTECHAMA",
];

function normalizeCode(code) {
  return String(code || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

function uniqueCodes() {
  const seen = {};
  const out = [];
  for (const raw of CUSTOM_CODES) {
    const code = normalizeCode(raw);
    if (code.length !== 8) continue;
    if (seen[code]) continue;
    seen[code] = true;
    out.push(code);
  }
  return out;
}

function formatCode(code) {
  const raw = String(code || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (raw.length === 8) return raw.slice(0, 4) + "-" + raw.slice(4);
  return raw;
}

async function requestCustomPairCode(sock, phoneNumber) {
  const codes = uniqueCodes();
  let lastErr = null;
  for (const code of codes) {
    try {
      const got = await sock.requestPairingCode(phoneNumber, code);
      return got || code;
    } catch (err) {
      lastErr = err;
    }
  }
  try {
    const got = await sock.requestPairingCode(phoneNumber);
    return got;
  } catch (err) {
    throw lastErr || err;
  }
}

module.exports = {
  CUSTOM_CODES,
  uniqueCodes,
  formatCode,
  requestCustomPairCode,
  normalizeCode,
};
