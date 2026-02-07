const axios = require('axios');
const db = require('./db'); 
require('dotenv').config();

async function getProviderId(name, url) {
    const [rows] = await db.query('SELECT id FROM providers WHERE name = ?', [name]);
    if (rows.length > 0) return rows[0].id;

    const [result] = await db.query(
        'INSERT INTO providers (name, website_url) VALUES (?, ?)',
        [name, url]
    );
    return result.insertId;
  }
async function harvestCoursera() {
    console.log("--- Starting Coursera Harvest ---");
    const providerId = await getProviderId('Coursera', 'https://www.coursera.org');
    
    try {
        const response = await axios.get('https://api.coursera.org/api/courses.v1?limit=10&fields=description,difficultyLevel,primaryLanguages,domainIds');
        const courses = response.data.elements;

        for (let course of courses) {
            const values = [
                providerId,
                course.name,
                course.description || "No description available",
                course.domainIds ? course.domainIds.join(', ') : 'General', 
                course.primaryLanguages ? course.primaryLanguages[0] : 'en', 
                course.difficultyLevel || 'Beginner', 
                `https://www.coursera.org/learn/${course.slug}` 
            ];

            await db.query(
                `INSERT INTO courses (provider_id, title, description, category, language, level, url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                    title = VALUES(title),
                    description = VALUES(description),
                    category = VALUES(category),
                    last_updated = CURRENT_TIMESTAMP`, 
                values
            );
        }
        console.log(`✅ Coursera: Imported ${courses.length} courses.`);
    } catch (err) {
        console.error("❌ Coursera Error:", err.message);
    }
}

async function harvestEdX() {
    console.log("--- Starting edX Harvest ---");
    const providerId = await getProviderId('edX', 'https://www.edx.org');
    
    try {
        const response = await axios.get('https://courses.edx.org/api/courses/v1/courses/');
        const courses = response.data.results;

        for (let course of courses.slice(0, 10)) {
            const categoryName = (course.subjects && course.subjects.length > 0) 
                ? course.subjects[0].name 
                : 'Education'; 

            const values = [
                providerId,
                course.name,
                course.short_description || "An open course from edX.",
                categoryName, 
                "en",
                "Intermediate", 
                `https://www.edx.org/course/${course.id}`
            ];

           await db.query(
                `INSERT INTO courses (provider_id, title, description, category, language, level, url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                    title = VALUES(title),
                    description = VALUES(description),
                    category = VALUES(category),
                    last_updated = CURRENT_TIMESTAMP`, 
                values
            );
        }
        console.log(`✅ edX: Imported ${courses.length > 10 ? 10 : courses.length} courses.`);
    } catch (err) {
        console.error("❌ edX Error:", err.message);
    }
}

async function runHarvester() {
    try {
        await harvestCoursera();
        await harvestEdX();
        console.log("\n🚀 All harvesting jobs completed successfully!");
    } catch (error) {
        console.error("Critical error during harvesting:", error);
    } finally {
        process.exit();
    }
}

runHarvester();