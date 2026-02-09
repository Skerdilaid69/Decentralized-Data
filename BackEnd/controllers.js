const db = require('./db');
const Course = require('./models');
const harvester = require('./harvester');

exports.getCourses = async (req, res) => {
    try {
        // 1. Get query parameters (default to Page 1, 10 items per page)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12; // 12 is good for a 3x4 grid layout
        const offset = (page - 1) * limit;

        // 2. Build the SQL Query with LIMIT and OFFSET
        // We also count the TOTAL courses so the frontend knows how many pages exist.
        const query = `
            SELECT courses.*, providers.name AS source_name 
            FROM courses 
            JOIN providers ON courses.provider_id = providers.id
            LIMIT ? OFFSET ?
        `;

        const countQuery = `SELECT COUNT(*) as total FROM courses`;

        // 3. Run both queries
        const [courses] = await db.query(query, [limit, offset]);
        const [countResult] = await db.query(countQuery);
        
        const totalCourses = countResult[0].total;
        const totalPages = Math.ceil(totalCourses / limit);

        // 4. Send a "Smart Response" containing data + pagination info
        res.json({
            data: courses,
            meta: {
                totalCourses,
                totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const id = req.params.id;
        const course = await Course.getById(id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const recommendations = await Course.getRecommendations(id);
        
        res.json({ ...course, recommendations });
    } catch (err) {
        console.error("Error in getCourseById:", err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.syncProvider = async (req, res) => {
    try {
        const source = req.params.source.toLowerCase();
        
        if (source === 'coursera') {
            await harvester.harvestCoursera();
            res.json({ message: "Coursera sync completed successfully!" });
        } else if (source === 'edx') {
            await harvester.harvestEdX();
            res.json({ message: "edX sync completed successfully!" });
        } else {
            res.status(400).json({ error: "Invalid source. Use 'coursera' or 'edx'." });
        }
    } catch (err) {
        console.error("Sync Error:", err.message);
        res.status(500).json({ error: "Failed to sync data from provider." });
    }
};