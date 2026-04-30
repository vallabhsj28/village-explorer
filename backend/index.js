const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "village_api",
  password: "2486", 
  port: 5432,
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
app.get("/villages/:districtId", async (req, res) => {
  const result = await pool.query(`
    SELECT v.name AS village
    FROM village v
    JOIN subdistrict sd ON v.subdistrict_id = sd.id
    WHERE sd.district_id = $1
    LIMIT 100
  `, [req.params.districtId]);

  res.json(result.rows);
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