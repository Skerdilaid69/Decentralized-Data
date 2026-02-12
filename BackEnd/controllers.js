const Course = require('./models');
const harvester = require('./harvester');

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