const Course = require('./model');

exports.getCourses = async (req, res) => {
    try {
        const { search, language, level } = req.query;
        const courses = await Course.getAll(search, language, level);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
};