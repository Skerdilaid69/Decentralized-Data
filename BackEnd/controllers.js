    const Course = require('./models');
    const db = require('./db'); 
exports.getCourses = async (req, res) => {
    try {
        const { search, language, level, provider_id, category } = req.query;
        
        let sql = `
            SELECT courses.*, providers.name AS source_name 
            FROM courses 
            INNER JOIN providers ON courses.provider_id = providers.id 
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (language && language !== '') {
            sql += ' AND language LIKE ?';
            params.push(`%${language}%`);
        }
        if (level) {
            sql += ' AND level = ?';
            params.push(level);
        }
        if (provider_id) {
            sql += ' AND provider_id = ?';
            params.push(provider_id);
        }
        if (category && category.trim() !== '') {
    sql += ' AND category LIKE ?';
    params.push(`%${category}%`);
}

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

    exports.getCourseById = async (req, res) => {
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

    };