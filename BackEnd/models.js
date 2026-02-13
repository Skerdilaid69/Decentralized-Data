const db = require('./db');
const bcrypt = require('bcrypt');
const saltRounds = 10; 

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
    },
   getAnalytics: async () => {
    const providersSql = `
        SELECT p.name as label, COUNT(c.id) as value 
        FROM courses c 
        JOIN providers p ON c.provider_id = p.id 
        GROUP BY p.name
    `;
    
    const languagesSql = `
        SELECT language as label, COUNT(*) as value 
        FROM courses 
        GROUP BY language
    `;

    const clustersSql = `
        SELECT cluster_id as label, COUNT(*) as value 
        FROM course_clusters 
        GROUP BY cluster_id
    `;

    const [providersRes, languagesRes, clustersRes] = await Promise.all([
        db.query(providersSql),
        db.query(languagesSql),
        db.query(clustersSql)
    ]);

    return {
        byProvider: providersRes[0],
        byLanguage: languagesRes[0],
        byCluster: clustersRes[0]
    };
    }
};

const User = {
    create: async (username, email, password) => {
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const query = `
                INSERT INTO users (username, email, hashed_password) 
                VALUES (?, ?, ?)
            `;

            const [result] = await db.execute(query, [username, email, hashedPassword]);
            
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },
    
    findByEmail: async (email) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        
        const [rows] = await db.execute(query, [email]);
        
        return rows[0];
    }
};

const Bookmark = {
    find: async (userId, courseId) => {
        const [rows] = await db.query('SELECT * FROM bookmarks WHERE user_id = ? AND item_id = ?', [userId, courseId]);
        return rows[0];
    },
    add: async (userId, courseId) => {
        return await db.query('INSERT INTO bookmarks (user_id, item_id) VALUES (?, ?)', [userId, courseId]);
    },
    remove: async (bookmarkId) => {
        return await db.query('DELETE FROM bookmarks WHERE bookmark_id = ?', [bookmarkId]);
    },
    getAllByUser: async (userId) => {
        const query = `
            SELECT c.*, b.created_at as bookmarked_at 
            FROM bookmarks b
            JOIN courses c ON b.item_id = c.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    }
};

const History = {
    upsert: async (userId, courseId) => {
        return await db.query(
            'INSERT INTO history (user_id, item_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP',
            [userId, courseId]
        );
    },
    getAllByUser: async (userId) => {
        const query = `
            SELECT c.*, h.viewed_at 
            FROM history h
            JOIN courses c ON h.item_id = c.id
            WHERE h.user_id = ?
            ORDER BY h.viewed_at DESC
            LIMIT 20
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    }
};

module.exports = { User, Course, Bookmark, History };