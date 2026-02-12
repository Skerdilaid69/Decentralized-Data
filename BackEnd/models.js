const db = require('./db');

const Course = {
    getAll: async (filters) => {
        const { search, language, level, provider_id, category, limit, offset } = filters;

        let whereClause = "WHERE 1=1";
        const params = [];

        if (search) {
            whereClause += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (language) {
        const languageArray = language.split(','); 
        const placeholders = languageArray.map(() => '?').join(', ');
    
            whereClause += ` AND language IN (${placeholders})`;
            params.push(...languageArray);
}
        if (level) {
            whereClause += ' AND level = ?';
            params.push(level);
        }
        if (provider_id) {
            whereClause += ' AND provider_id = ?';
            params.push(provider_id);
        }
        if (category) {
            whereClause += ' AND (keywords LIKE ? OR category LIKE ?)';
            params.push(`%${category}%`, `%${category}%`);
        }

        const countSql = `SELECT COUNT(*) as total FROM courses ${whereClause}`;
        const [countResult] = await db.query(countSql, params);
        const total = countResult[0].total;

        const dataSql = `
            SELECT courses.*, providers.name AS source_name 
            FROM courses 
            INNER JOIN providers ON courses.provider_id = providers.id 
            ${whereClause} 
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.query(dataSql, [...params, limit, offset]);

        return { rows, total };
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