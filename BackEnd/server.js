const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const app = express();

// 1. GLOBAL ACCESS HEADERS: The skeleton key for macOS 403 errors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// 2. Main Course API
app.get('/api/courses', async (req, res) => {
    try {
        const { search, language, level } = req.query;
        let sql = 'SELECT * FROM courses WHERE 1=1';
        const params = [];

        if (search) {
            sql += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (language && language !== '') {
            sql += ' AND language LIKE ?';
            params.push(`%${language}%`);
        }
        if (level && level !== '') {
            sql += ' AND level LIKE ?';
            params.push(`%${level}%`);
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 3. Details API
app.get('/api/courses/:id', async (req, res) => {
    try {
        // 1. Fetch the main course
        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Not found" });

        const course = rows[0];

        // 2. Fetch the similar courses if they exist
        let recommendations = [];
        if (course.similar_ids) {
            const ids = course.similar_ids.split(',');
            // Fetch titles and IDs for the recommendations
            const [recRows] = await db.query('SELECT id, title FROM courses WHERE id IN (?)', [ids]);
            recommendations = recRows;
        }

        // 3. Send everything back together
        res.json({ ...course, recommendations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 BackEnd Server is live on http://localhost:${PORT}`);
});