const fs = require('fs');
const path = require('path');
const db = require('./db');
const { exec } = require('child_process');

const runSparkJob = () => {
    const python = process.env.PYTHON_PATH;
    const script = process.env.SPARK_ML_PATH;

    if (!python || !script) return;

    const options = {
        maxBuffer: 1024 * 1024 * 50 
    };

    exec(`"${python}" "${script}"`, options, (error, stdout, stderr) => {
        if (error) return;
        console.log(stdout);
    });
};

async function ensureProviderExists() {
    try {
        await db.query(
            `INSERT IGNORE INTO providers (id, name, website_url) VALUES (1, 'Microsoft Learn', 'https://learn.microsoft.com')`
        );
    } catch (err) {
        console.error(err.message);
    }
}

async function saveCoursesToDB(courses) {
    for (const course of courses) {
        const safeDate = course.last_updated ? new Date(course.last_updated) : new Date();
        const query = `
            INSERT INTO courses 
            (title, description, external_id, url, language, level, provider_id, keywords, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                title = VALUES(title),
                description = VALUES(description),
                last_updated = VALUES(last_updated),
                keywords = VALUES(keywords)
        `;

        try {
            await db.query(query, [
                course.title, 
                course.description, 
                course.external_id, 
                course.url, 
                course.language, 
                course.level, 
                course.provider_id, 
                course.keywords,
                safeDate
            ]);
        } catch (err) {
            console.error(err.message);
        }
    }
}

exports.harvestMicrosoft = async () => {
    try {
        await ensureProviderExists();
        const filePath = path.join(__dirname, 'Data', 'microsoft_data.json');
        
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found");
        }

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);
        const modules = data.modules || [];

        const normalizedCourses = modules.map(item => ({
            title: item.title,
            description: item.summary,
            external_id: item.uid,
            url: item.url,
            language: 'en',
            level: item.levels && item.levels.length > 0 ? item.levels[0] : 'Beginner',
            provider_id: 1,
            keywords: [...(item.roles || []), ...(item.products || [])].join(', '),
            last_updated: item.last_modified
        }));

        await saveCoursesToDB(normalizedCourses);
        
        runSparkJob();

        return { message: "Sync Successful and Spark Job Triggered" };

    } catch (err) {
        return { error: err.message };
    }
};

exports.initializeDatabase = async () => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM courses');
        if (rows[0].count === 0) {
            await exports.harvestMicrosoft(); 
        }
    } catch (err) {
        console.error(err.message);
    }
};