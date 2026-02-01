const db = require('./db');
const axios = require('axios'); // Install with: npm install axios

const harvestFromSourceA = async () => {
  try {
    // Requirement 4.1.2: Calling an external API (Example)
    const response = await axios.get('https://api.sample-mooc.com/courses'); 
    const externalCourses = response.data;

    for (let course of externalCourses) {
      // Requirement 4.1.2.2: Transforming to your unified schema
      const unifiedData = {
        title: course.name,
        description: course.summary,
        language: course.lang || 'English',
        level: course.difficulty,
        source_name: 'Repository A',
        source_url: 'https://repository-a.com'
      };

      await db.query(
        'INSERT INTO courses (title, description, language, level, source_name, source_url) VALUES (?, ?, ?, ?, ?, ?)',
        [unifiedData.title, unifiedData.description, unifiedData.language, unifiedData.level, unifiedData.source_name, unifiedData.source_url]
      );
    }
    console.log("Harvesting complete!");
  } catch (error) {
    console.error("Harvesting failed:", error);
  }
};

module.exports = { harvestFromSourceA };