const db = require('./db');
const { User, Course } = require('./models'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const harvester = require('./harvester');
require('dotenv').config();

exports.getCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;

        const filters = {
            search: req.query.search,
            language: req.query.language,
            level: req.query.level,
            provider_id: req.query.provider_id,
            category: req.query.category,
            limit,
            offset
        };

        const { rows, total } = await Course.getAll(filters);

        res.json({
            data: rows,
            meta: {
                totalCourses: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.getById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRecommendations = async (req, res) => {
    try {
        const recommendations = await Course.getRecommendations(req.params.id);
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch recommendations." });
    }
};

exports.syncProvider = async (req, res) => {
    try {
        const result = await harvester.syncAll();
        
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Global sync failed: " + err.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const stats = await Course.getAnalytics();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch analytics: " + err.message });
    }
};

exports.register = async (req, res) => {
    try {
        
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const userId = await User.create(username, email, password);

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (err) {
        console.error("Error in register:", err.message);
        res.status(500).json({ error: "Registration failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.hashed_password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.user_id, username: user.username },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error("Error in login:", err.message);
        res.status(500).json({ error: "Login failed" });
    }
};

exports.toggleBookmark = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.userId;

        const [existing] = await db.query(
            'SELECT * FROM bookmarks WHERE user_id = ? AND item_id = ?', 
            [userId, courseId]
        );

        if (existing.length > 0) {
            await db.query('DELETE FROM bookmarks WHERE bookmark_id = ?', [existing[0].bookmark_id]);
            res.json({ message: 'Bookmark removed', isBookmarked: false });
        } else {
            await db.query('INSERT INTO bookmarks (user_id, item_id) VALUES (?, ?)', [userId, courseId]);
            res.json({ message: 'Bookmark added', isBookmarked: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle bookmark' });
    }
};

exports.checkBookmark = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.userId;

        const [rows] = await db.query(
            'SELECT * FROM bookmarks WHERE user_id = ? AND item_id = ?', 
            [userId, courseId]
        );

        res.json({ isBookmarked: rows.length > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to check bookmark status' });
    }
};

exports.addToHistory = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.userId;

        await db.query(
            'INSERT INTO history (user_id, item_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP',
            [userId, courseId]
        );
        res.json({ message: 'History updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update history' });
    }
};

exports.getBookmarks = async (req, res) => {
    try {
        const userId = req.user.userId;
        const query = `
            SELECT c.*, b.created_at as bookmarked_at 
            FROM bookmarks b
            JOIN courses c ON b.item_id = c.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        const [rows] = await db.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const query = `
            SELECT c.*, h.viewed_at 
            FROM history h
            JOIN courses c ON h.item_id = c.id
            WHERE h.user_id = ?
            ORDER BY h.viewed_at DESC
            LIMIT 20
        `;
        const [rows] = await db.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

