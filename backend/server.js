require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const { parse } = require("csv-parse");   
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { body, validationResult } = require("express-validator");

const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "okHnAqs65J!Z93";
const VOTE_END_ISO =
  process.env.VOTE_END_ISO || new Date(Date.now() + 86400000).toISOString();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "x-admin-token"],
  })
);




// anti spam
app.use(rateLimit({ windowMs: 60000, max: 120 }));

// dossier upload
const UPLOAD_DIR = path.join(__dirname, "uploads/photos");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const uploadCSV = multer({ dest: path.join(__dirname, "uploads/csv") });

// upload photo candidats
const storagePhotos = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "_" + file.originalname.replace(/\s+/g, "_")),
});
const uploadPhoto = multer({ storage: storagePhotos });


// ----------------------------
// DATABASE INITIALIZATION
// ----------------------------
const DB_FILE = path.join(__dirname, "vote.db");
const db = new sqlite3.Database(DB_FILE);

function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS allowed_voters(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT,
        prenom TEXT,
        etablissement TEXT,
        mle TEXT UNIQUE,
        has_voted INTEGER DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS candidates(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        manifesto TEXT,
        photo TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS votes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voter_mle TEXT UNIQUE,
        candidate_id INTEGER,
        ts TEXT,
        ip TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS audit_log(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        payload TEXT,
        ts TEXT
      )
    `);
  });
}
initDb();

function logAudit(action, payload) {
  db.run(
    `INSERT INTO audit_log(action,payload,ts) VALUES (?,?,?)`,
    [action, JSON.stringify(payload), new Date().toISOString()]
  );
}


// ----------------------------
// ADMIN VERIFICATION
// ----------------------------
function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN)
    return res.status(401).json({ error: "Unauthorized" });
  next();
}


// ----------------------------
// ADMIN : IMPORT CSV
// ----------------------------
app.post(
  "/admin/upload-voters",
  requireAdmin,
  uploadCSV.single("voters"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier CSV reçu" });
    }

    const filePath = req.file.path;
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ",", columns: true, trim: true }))
      .on("data", (row) => rows.push(row))
      .on("error", (err) => {
        console.log("❌ Erreur CSV :", err);
        return res.status(500).json({ error: "Erreur lecture CSV" });
      })
      .on("end", () => {
        console.log("📥 Total lignes CSV :", rows.length);

        const stmt = db.prepare(`
          INSERT OR IGNORE INTO allowed_voters (nom, prenom, etablissement, mle)
          VALUES (?, ?, ?, ?)
        `);

        rows.forEach((r) => {
          const mle =
            r["N°MLE"] ||
            r["N° MLE"] ||
            r["NO_MLE"] ||
            r["NO MLE"] ||
            r["MATRICULE"] ||
            r["mle"] ||
            r["Mle"] ||
            "";

          if (!mle) return;

          stmt.run(
            r["NOM"] || r["Nom"] || r["nom"] || "",
            r["PRENOM"] || r["Prenom"] || r["prenom"] || "",
            r["ETABLISSEMENT"] || r["Etablissement"] || r["etablissement"] || "",
            mle
          );
        });

        stmt.finalize();
        fs.unlinkSync(filePath);

        console.log("✅ Importation dans la base terminée !");

        res.json({
          ok: true,
          msg: "📥 Importation réussie",
          inserted: rows.length,
        });
      });
  }
);



// ----------------------------
// ADMIN : ADD CANDIDAT + PHOTO
// ----------------------------
app.post(
  "/admin/candidates",
  requireAdmin,
  uploadPhoto.single("photo"),
  (req, res) => {
    const { name, manifesto } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    const photoPath = req.file
      ? "/uploads/photos/" + req.file.filename
      : null;

    db.run(
      `INSERT INTO candidates(name, manifesto, photo) VALUES (?,?,?)`,
      [name, manifesto || "", photoPath],
      function (err) {
        if (err) return res.status(500).json({ error: "DB error" });

        logAudit("add_candidate", {
          id: this.lastID,
          name,
          photo: photoPath,
        });

        res.json({
          id: this.lastID,
          name,
          manifesto,
          photo: photoPath,
        });
      }
    );
  }
);

// ----------------------------
// PUBLIC : LISTE CANDIDATS
// ----------------------------
app.get("/candidates", (req, res) => {
  db.all(
    `SELECT id, name, manifesto, photo FROM candidates ORDER BY id`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });

      rows = rows.map((c) => ({
        ...c,
        photo_url: c.photo ? `${req.protocol}://${req.get("host")}${c.photo}` : null,
      }));

      res.json({ candidates: rows });
    }
  );
});



// ----------------------------
// PUBLIC : VOTE
// ----------------------------
app.post(
  "/vote",
  [
    body("nom").isLength({ min: 1 }),
    body("prenom").isLength({ min: 1 }),
    body("etablissement").isLength({ min: 1 }),
    body("mle").isLength({ min: 1 }),
    body("candidate_id").isInt(),
  ],
  (req, res) => {
    if (new Date().toISOString() > VOTE_END_ISO)
      return res.status(403).json({ error: "Voting closed" });

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { nom, prenom, etablissement, mle, candidate_id } = req.body;
    console.log("🔍 REQUÊTE VOTE :", req.body);

function normalize(text) {
  return text
    .toString()
    .normalize("NFD")               // enlever accents
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, "")           // enlever espaces
    .replace(/-/g, "")             // enlever tirets
    .toLowerCase();                // minuscules
}

const nNom = normalize(nom);
const nPrenom = normalize(prenom);
const nEtab = normalize(etablissement);
const nMle = normalize(mle);

db.get(
  `
  SELECT *,
    lower(replace(replace(replace(nom,' ',''),'-',''), 'é','e')) AS nom_norm,
    lower(replace(replace(replace(prenom,' ',''),'-',''), 'é','e')) AS prenom_norm,
    lower(replace(replace(replace(etablissement,' ',''),'-',''), 'é','e')) AS etab_norm,
    lower(replace(replace(replace(mle,' ',''),'-',''), 'é','e')) AS mle_norm
  FROM allowed_voters
  WHERE nom_norm = ?
    AND prenom_norm = ?
    AND etab_norm = ?
    AND mle_norm = ?
  `,
  [nNom, nPrenom, nEtab, nMle],
  (err, voter) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!voter)
      return res.status(403).json({ error: "Voter not in CSV" });
    if (voter.has_voted)
      return res.status(403).json({ error: "Already voted" });

    const ts = new Date().toISOString();
    const ip = req.ip;

    db.run(
      `INSERT INTO votes(voter_mle, candidate_id, ts, ip)
       VALUES (?,?,?,?)`,
      [mle, candidate_id, ts, ip],
      function (err2) {
        if (err2)
          return res.status(500).json({ error: "Vote failed" });

        db.run(`UPDATE allowed_voters SET has_voted=1 WHERE mle=?`, [mle]);
        logAudit("vote", { mle, candidate_id });

        res.json({ ok: true, msg: "Vote enregistré" });
      }
    );
  }
);

  }
);

// ----------------------------
// PUBLIC : RESULTATS
// ----------------------------
app.get("/results", (req, res) => {
  db.all(
    `
    SELECT c.id, c.name,
      COUNT(v.id) AS votes,
      ROUND( (COUNT(v.id) * 100.0 / (SELECT COUNT(*) FROM votes)), 2 ) AS percent
    FROM candidates c
    LEFT JOIN votes v ON v.candidate_id = c.id
    GROUP BY c.id
    ORDER BY votes DESC
    `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });

      const totalVotes = rows.reduce((s, r) => s + r.votes, 0);
      const winner = rows[0] || null;

      res.json({
        ok: true,
        results: rows,
        totalVotes,
        winner,
      });
    }
  );
});

// ----------------------------
// PUBLIC : STATUS
// ----------------------------
app.get("/status", (req, res) => {
  const now = new Date();
  const end = new Date(VOTE_END_ISO);
  res.json({
    vote_end: VOTE_END_ISO,
    ms_left: Math.max(0, end - now),
  });
});

// ----------------------------
// STATIC FILES (PHOTOS)
// ----------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----------------------------
// DEMARER SERVER
// ----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running");
});
