require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { verifyMessage } = require("ethers");

const app = express();
const port = Number(process.env.API_PORT || 4000);
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const dataDir = path.join(__dirname, "data");
const profilesFile = path.join(dataDir, "profiles.json");
const authFile = path.join(dataDir, "auth.json");
const landingFile = path.join(dataDir, "landing.json");
const studentsFile = path.join(dataDir, "students.json");

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: "2mb" }));

function normalizeWallet(wallet) {
  return String(wallet || "").toLowerCase();
}

function randomHex(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}

function issueSession(wallet) {
  const token = randomHex(32);
  const auth = readAuth();
  auth.sessions[token] = {
    wallet: normalizeWallet(wallet),
    createdAt: Date.now()
  };
  writeAuth(auth);
  return token;
}

function cleanupAuthStore() {
  const auth = readAuth();
  const now = Date.now();
  const nonceMaxAgeMs = 5 * 60 * 1000;
  const sessionMaxAgeMs = 24 * 60 * 60 * 1000;

  Object.keys(auth.nonces).forEach((wallet) => {
    if (now - auth.nonces[wallet].createdAt > nonceMaxAgeMs) {
      delete auth.nonces[wallet];
    }
  });

  Object.keys(auth.sessions).forEach((token) => {
    if (now - auth.sessions[token].createdAt > sessionMaxAgeMs) {
      delete auth.sessions[token];
    }
  });

  writeAuth(auth);
}

function authRequired(req, res, next) {
  cleanupAuthStore();
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  const auth = readAuth();
  const session = auth.sessions[token];
  if (!session) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const maxAgeMs = 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > maxAgeMs) {
    delete auth.sessions[token];
    writeAuth(auth);
    return res.status(401).json({ error: "Session expired" });
  }

  req.auth = {
    token,
    wallet: session.wallet
  };
  return next();
}

function adminRequired(req, res, next) {
  const adminWallet = normalizeWallet(
    process.env.ADMIN_WALLET || "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
  );
  if (req.auth.wallet !== adminWallet) {
    return res.status(403).json({ error: "Admin access required" });
  }
  return next();
}

function ensureDataStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(profilesFile)) {
    fs.writeFileSync(profilesFile, JSON.stringify({ admin: {}, institute: {}, student: {} }, null, 2));
  }
  if (!fs.existsSync(authFile)) {
    fs.writeFileSync(authFile, JSON.stringify({ nonces: {}, sessions: {} }, null, 2));
  }
  if (!fs.existsSync(landingFile)) {
    fs.writeFileSync(
      landingFile,
      JSON.stringify(
        {
          heroTitle: "Academic Credential Verification Platform",
          heroSubtitle:
            "Issue, store, and verify tamper-proof academic certificates on blockchain with IPFS-backed documents.",
          aboutText:
            "This platform enables trusted digital certificate management for institutes, students, and verifiers with role-based workflows.",
          guide: {
            name: "Dr HemaMalini B H",
            title: "Project Guide",
            imageUrl: "",
            bio: ""
          },
          team: [
            { name: "Bharat Bahadur Kadayat", role: "Student Developer", email: "", imageUrl: "" },
            { name: "Darshan A B", role: "Student Developer", email: "", imageUrl: "" },
            { name: "Gaurav Nayak K", role: "Student Developer", email: "", imageUrl: "" },
            { name: "Harsha Patil", role: "Student Developer", email: "", imageUrl: "" }
          ],
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )
    );
  }
  if (!fs.existsSync(studentsFile)) {
    fs.writeFileSync(studentsFile, JSON.stringify({ institutes: {} }, null, 2));
  }
}

function readProfiles() {
  ensureDataStore();
  return JSON.parse(fs.readFileSync(profilesFile, "utf8"));
}

function writeProfiles(data) {
  ensureDataStore();
  fs.writeFileSync(profilesFile, JSON.stringify(data, null, 2));
}

function readAuth() {
  ensureDataStore();
  return JSON.parse(fs.readFileSync(authFile, "utf8"));
}

function writeAuth(data) {
  ensureDataStore();
  fs.writeFileSync(authFile, JSON.stringify(data, null, 2));
}

function readLanding() {
  ensureDataStore();
  return JSON.parse(fs.readFileSync(landingFile, "utf8"));
}

function writeLanding(data) {
  ensureDataStore();
  fs.writeFileSync(landingFile, JSON.stringify(data, null, 2));
}

function readStudents() {
  ensureDataStore();
  return JSON.parse(fs.readFileSync(studentsFile, "utf8"));
}

function writeStudents(data) {
  ensureDataStore();
  fs.writeFileSync(studentsFile, JSON.stringify(data, null, 2));
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "acadamic-blockchain-api" });
});

app.get("/api/public/landing-content", (_req, res) => {
  const content = readLanding();
  return res.json({ content });
});

app.get("/api/landing-content", (_req, res) => {
  const content = readLanding();
  return res.json({ content });
});

app.post("/api/auth/nonce", (req, res) => {
  const wallet = normalizeWallet(req.body?.wallet);
  if (!wallet || !wallet.startsWith("0x")) {
    return res.status(400).json({ error: "Invalid wallet" });
  }

  const nonce = randomHex(16);
  const auth = readAuth();
  auth.nonces[wallet] = {
    nonce,
    createdAt: Date.now()
  };
  writeAuth(auth);
  return res.json({ nonce });
});

app.post("/api/auth/verify", (req, res) => {
  try {
    const wallet = normalizeWallet(req.body?.wallet);
    const signature = req.body?.signature;
    if (!wallet || !wallet.startsWith("0x") || !signature) {
      return res.status(400).json({ error: "Invalid wallet/signature" });
    }

    cleanupAuthStore();
    const auth = readAuth();
    const pending = auth.nonces[wallet];
    if (!pending) {
      return res.status(400).json({ error: "Nonce not found. Request nonce first." });
    }

    const nonceMaxAgeMs = 5 * 60 * 1000;
    if (Date.now() - pending.createdAt > nonceMaxAgeMs) {
      delete auth.nonces[wallet];
      writeAuth(auth);
      return res.status(400).json({ error: "Nonce expired" });
    }

    const recovered = normalizeWallet(verifyMessage(pending.nonce, signature));
    if (recovered !== wallet) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    delete auth.nonces[wallet];
    writeAuth(auth);
    const token = issueSession(wallet);
    return res.json({ ok: true, token, wallet });
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify signature", details: error.message });
  }
});

app.post("/api/auth/logout", authRequired, (req, res) => {
  const auth = readAuth();
  delete auth.sessions[req.auth.token];
  writeAuth(auth);
  return res.json({ ok: true });
});

app.get("/api/auth/me", authRequired, (req, res) => {
  return res.json({ wallet: req.auth.wallet });
});

app.post("/api/auth/refresh", authRequired, (req, res) => {
  const auth = readAuth();
  delete auth.sessions[req.auth.token];
  writeAuth(auth);
  const token = issueSession(req.auth.wallet);
  return res.json({ ok: true, token, wallet: req.auth.wallet });
});

app.get("/api/institute/students/:wallet", authRequired, (req, res) => {
  const wallet = normalizeWallet(req.params.wallet);
  if (!wallet || !wallet.startsWith("0x")) {
    return res.status(400).json({ error: "Invalid wallet" });
  }
  if (wallet !== req.auth.wallet) {
    return res.status(403).json({ error: "Wallet mismatch for session" });
  }

  const db = readStudents();
  const students = db?.institutes?.[wallet] || [];
  return res.json({ students });
});

app.put("/api/institute/students/:wallet", authRequired, (req, res) => {
  const wallet = normalizeWallet(req.params.wallet);
  if (!wallet || !wallet.startsWith("0x")) {
    return res.status(400).json({ error: "Invalid wallet" });
  }
  if (wallet !== req.auth.wallet) {
    return res.status(403).json({ error: "Wallet mismatch for session" });
  }

  const students = Array.isArray(req.body?.students) ? req.body.students : null;
  const signature = String(req.body?.signature || "");
  const signatureMessage = String(req.body?.signatureMessage || "");
  if (!students) {
    return res.status(400).json({ error: "students array is required" });
  }
  if (!signature || !signatureMessage) {
    return res.status(400).json({ error: "MetaMask signature is required to save student registry" });
  }

  const normalized = students.map((s) => ({
    name: String(s.name || "").trim(),
    studentId: String(s.studentId || "").trim(),
    walletAddress: normalizeWallet(s.walletAddress),
    email: String(s.email || "").trim(),
    department: String(s.department || "").trim(),
    section: String(s.section || "").trim(),
    semester: String(s.semester || "").trim(),
    batchYear: String(s.batchYear || "").trim()
  }));

  try {
    const recovered = normalizeWallet(verifyMessage(signatureMessage, signature));
    if (recovered !== wallet || recovered !== req.auth.wallet) {
      return res.status(401).json({ error: "Invalid signature for institute wallet" });
    }
    if (!signatureMessage.toLowerCase().includes("institute student registry save")) {
      return res.status(400).json({ error: "Invalid signature message format" });
    }
    if (!signatureMessage.toLowerCase().includes(`wallet: ${wallet}`)) {
      return res.status(400).json({ error: "Signature message wallet mismatch" });
    }
  } catch (error) {
    return res.status(401).json({ error: "Failed to verify signature", details: error.message });
  }

  const invalid = normalized.find(
    (s) => !s.name || !s.studentId || !s.walletAddress || !s.walletAddress.startsWith("0x")
  );
  if (invalid) {
    return res.status(400).json({ error: "Each student needs name, studentId, valid walletAddress" });
  }

  const db = readStudents();
  if (!db.institutes) db.institutes = {};
  db.institutes[wallet] = normalized;
  writeStudents(db);
  return res.json({ ok: true, students: normalized });
});

app.get("/api/profiles/:role/:wallet", authRequired, (req, res) => {
  const role = (req.params.role || "").toLowerCase();
  const wallet = normalizeWallet(req.params.wallet);
  if (!["admin", "institute", "student"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  if (!wallet || !wallet.startsWith("0x")) {
    return res.status(400).json({ error: "Invalid wallet" });
  }
  if (wallet !== req.auth.wallet) {
    return res.status(403).json({ error: "Wallet mismatch for session" });
  }

  const profiles = readProfiles();
  const profile = profiles?.[role]?.[wallet] || null;
  return res.json({ profile });
});

app.get("/api/profiles/public/student/:wallet", authRequired, (req, res) => {
  const wallet = normalizeWallet(req.params.wallet);
  if (!wallet || !wallet.startsWith("0x")) {
    return res.status(400).json({ error: "Invalid wallet" });
  }
  const profiles = readProfiles();
  const p = profiles?.student?.[wallet] || null;
  if (!p) return res.json({ profile: null });
  return res.json({
    profile: {
      walletAddress: wallet,
      displayName: p.displayName || "",
      avatarUrl: p.avatarUrl || "",
      email: p.email || ""
    }
  });
});

app.get("/api/student/registry/me", authRequired, (req, res) => {
  const wallet = req.auth.wallet;
  const db = readStudents();
  const institutes = db?.institutes || {};
  for (const [instituteWallet, rows] of Object.entries(institutes)) {
    const found = (rows || []).find((s) => normalizeWallet(s.walletAddress) === wallet);
    if (found) {
      return res.json({
        student: {
          ...found,
          instituteWallet
        }
      });
    }
  }
  return res.json({ student: null });
});

app.put("/api/profiles/:role/:wallet", authRequired, (req, res) => {
  const role = (req.params.role || "").toLowerCase();
  const wallet = normalizeWallet(req.params.wallet);
  if (!["admin", "institute", "student"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  if (!wallet || !wallet.startsWith("0x")) {
    return res.status(400).json({ error: "Invalid wallet" });
  }
  if (wallet !== req.auth.wallet) {
    return res.status(403).json({ error: "Wallet mismatch for session" });
  }

  const payload = req.body || {};
  const profiles = readProfiles();
  const prev = profiles?.[role]?.[wallet] || {};
  profiles[role][wallet] = {
    ...prev,
    ...payload,
    walletAddress: wallet,
    updatedAt: new Date().toISOString()
  };
  writeProfiles(profiles);
  return res.json({ ok: true, profile: profiles[role][wallet] });
});

app.post("/api/ipfs/upload", authRequired, upload.single("file"), async (req, res) => {
  try {
    if (!process.env.PINATA_JWT) {
      return res.status(500).json({
        error: "Server is missing PINATA_JWT"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "File is required"
      });
    }

    const data = new FormData();
    data.append("file", req.file.buffer, req.file.originalname);

    if (req.body.pinataMetadata) {
      data.append("pinataMetadata", req.body.pinataMetadata);
    }

    if (req.body.pinataOptions) {
      data.append("pinataOptions", req.body.pinataOptions);
    }

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: Infinity,
        headers: {
          ...data.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`
        }
      }
    );

    return res.json(response.data);
  } catch (error) {
    const status = error?.response?.status || 500;
    return res.status(status).json({
      error: "Pinata upload failed",
      details: error?.response?.data || error.message
    });
  }
});

app.post("/api/profiles/avatar", authRequired, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Avatar file is required" });
    }
    if (!process.env.PINATA_JWT) {
      return res.status(500).json({ error: "Server is missing PINATA_JWT" });
    }

    const data = new FormData();
    data.append("file", req.file.buffer, req.file.originalname);
    data.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
    data.append(
      "pinataMetadata",
      JSON.stringify({
        name: `avatar-${Date.now()}-${req.file.originalname}`
      })
    );

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: Infinity,
        headers: {
          ...data.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`
        }
      }
    );

    return res.json({
      cid: response.data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
    });
  } catch (error) {
    return res.status(500).json({
      error: "Avatar upload failed",
      details: error?.response?.data || error.message
    });
  }
});

app.put("/api/admin/landing-content", (req, res) => {
  try {
    const incoming = req.body || {};
    const current = readLanding();
    const next = {
      ...current,
      ...incoming,
      guide: {
        ...(current.guide || {}),
        ...(incoming.guide || {})
      },
      team: Array.isArray(incoming.team) ? incoming.team : current.team,
      updatedAt: new Date().toISOString()
    };
    writeLanding(next);
    return res.json({ ok: true, content: next });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save landing content", details: error.message });
  }
});

app.post("/api/admin/landing-image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }
    if (!process.env.PINATA_JWT) {
      return res.status(500).json({ error: "Server is missing PINATA_JWT" });
    }

    const data = new FormData();
    data.append("file", req.file.buffer, req.file.originalname);
    data.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
    data.append(
      "pinataMetadata",
      JSON.stringify({
        name: `landing-${Date.now()}-${req.file.originalname}`
      })
    );

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: Infinity,
        headers: {
          ...data.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`
        }
      }
    );

    return res.json({
      cid: response.data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
    });
  } catch (error) {
    return res.status(500).json({
      error: "Landing image upload failed",
      details: error?.response?.data || error.message
    });
  }
});

app.listen(port, () => {
  console.log(`[API] Running on http://127.0.0.1:${port}`);
});
