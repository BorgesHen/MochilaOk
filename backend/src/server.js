require ('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true
})
);

app.get("/health", async (req, res) => {
    try {
        const r = await pool.query("SELECT NOW() as now");
        res.json({ok: true, now: r.rows[0].now});
    } catch (err) {
        console.error(err);
        res.status(500).json({ok: false, error: "Database connection error"});
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));