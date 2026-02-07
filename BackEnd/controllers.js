const Course = require('./models');
const harvester = require('./harvester');

exports.getCourses = async (req, res) => {
    try {
        const { search, language, level, provider_id, category } = req.query;
        
        const courses = await Course.getAll(search, language, level, provider_id, category);
        
        res.json(courses);
    } catch (err) {
        console.error("Error in getCourses:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
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