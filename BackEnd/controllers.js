const db = require('./db');
const harvester = require('./harvester'); 

exports.getCourses = async (req, res) => {
    try {
        // A. Setup Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12; 
        const offset = (page - 1) * limit;

        // B. Setup Filters
        const { search, language, level, provider_id, category } = req.query;

        // C. Build the SQL Query (Dynamic WHERE clause)
        // We use "WHERE 1=1" so we can easily add "AND ..." conditions
        let whereClause = `FROM courses JOIN providers ON courses.provider_id = providers.id WHERE 1=1`;
        const queryParams = [];

        // Add Search Logic
        if (search) {
            whereClause += ` AND courses.title LIKE ?`;
            queryParams.push(`%${search}%`);
        }
        if (language) {
            whereClause += ` AND courses.language = ?`;
            queryParams.push(language);
        }
        if (level) {
            whereClause += ` AND courses.level = ?`;
            queryParams.push(level);
        }
        if (provider_id) {
            whereClause += ` AND courses.provider_id = ?`;
            queryParams.push(provider_id);
        }
        if (category) {
            whereClause += ` AND courses.keywords LIKE ?`;
            queryParams.push(`%${category}%`);
        }

        // D. Count Total Results (Required for Pagination)
        // We use the EXACT SAME filters to count accurately
        const countQuery = `SELECT COUNT(*) as total ${whereClause}`;
        const [countResult] = await db.query(countQuery, [...queryParams]);
        const totalCourses = countResult[0].total;

        // E. Fetch the Actual Data (Apply Limit/Offset here)
        const dataQuery = `SELECT courses.*, providers.name AS source_name ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset); // Add pagination params to the end

        const [courses] = await db.query(dataQuery, queryParams);
        const totalPages = Math.ceil(totalCourses / limit);

        // F. Send Response
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
        console.error("Error fetching courses:", err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

// --- 2. GET SINGLE COURSE ---
exports.getCourseById = async (req, res) => {
    try {
        const id = req.params.id;
        const query = `
            SELECT courses.*, providers.name AS source_name 
            FROM courses 
            JOIN providers ON courses.provider_id = providers.id
            WHERE courses.id = ?
        `;
        const [rows] = await db.query(query, [id]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Course not found" });

        // Send the course (you can add recommendations later if needed)
        res.json({ ...rows[0], recommendations: [] });
    } catch (err) {
        console.error("Error in getCourseById:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// --- 3. SYNC PROVIDER ---
exports.syncProvider = async (req, res) => {
    try {
        const source = req.params.source.toLowerCase();
        if (source === 'microsoft') {
            await harvester.harvestMicrosoft();
            res.json({ message: "Microsoft sync completed successfully!" });
        } else {
            res.json({ message: "Only Microsoft sync is enabled." });
        }
    } catch (err) {
        console.error("Sync Error:", err.message);
        res.status(500).json({ error: "Failed to sync data." });
    }
};