const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ===== STATES =====
app.get("/states", async (req, res) => {
  const result = await pool.query("SELECT * FROM state ORDER BY name");
  res.json(result.rows);
});

// ===== DISTRICTS =====
app.get("/districts/:stateId", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM district WHERE state_id = $1 ORDER BY name",
    [req.params.stateId]
  );
  res.json(result.rows);
});

// ===== VILLAGES BY DISTRICT =====
app.get("/villages", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.name AS village,
        d.name AS district,
        s.name AS state
      FROM village v
      JOIN subdistrict sd ON v.subdistrict_id = sd.id
      JOIN district d ON sd.district_id = d.id
      JOIN state s ON d.state_id = s.id
      LIMIT 100;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching villages");
  }
});
// ===== SEARCH =====
app.get("/search", async (req, res) => {
  const q = req.query.q;

  const result = await pool.query(`
    SELECT name AS village
    FROM village
    WHERE name ILIKE $1
    LIMIT 50
  `, [`%${q}%`]);

  res.json(result.rows);
});

// root test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});