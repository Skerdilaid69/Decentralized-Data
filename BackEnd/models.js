const db = require('./db');

const Course = {
    getAll: async (search, language, level, provider_id, category) => {
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
        if (language) {
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
        if (category) {
            sql += ' AND category LIKE ?';
            params.push(`%${category}%`);
        }

        const [rows] = await db.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const sql = `
            SELECT courses.*, providers.name AS source_name 
            FROM courses 
            INNER JOIN providers ON courses.provider_id = providers.id 
            WHERE courses.id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    },

    getRecommendations: async (id) => {
        const sql = `
            SELECT c.id, c.title, c.level, providers.name AS source_name
            FROM course_recommendations r
            JOIN courses c ON r.recommended_course_id = c.id
            JOIN providers ON c.provider_id = providers.id
            WHERE r.course_id = ?
            ORDER BY r.similarity_score DESC
            LIMIT 5
        `;
        const [rows] = await db.query(sql, [id]);
        return rows;
    }
};

module.exports = Course;

