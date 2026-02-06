require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Main Course API
app.get('/api/courses', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM courses');
        res.json(rows);
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 BackEnd Server is live on http://localhost:${PORT}`);
});