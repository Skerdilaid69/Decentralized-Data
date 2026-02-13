const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('./db');
const { spawn } = require('child_process');

async function ensureProvidersExist() {
    try {
        await db.query(
            `INSERT IGNORE INTO providers (id, name, website_url) VALUES (1, 'Microsoft Learn', 'https://learn.microsoft.com')`
        );
        await db.query(
            `INSERT IGNORE INTO providers (id, name, website_url) VALUES (2, 'Coursera', 'https://www.coursera.org')`
        );
        await db.query(
            `INSERT IGNORE INTO providers (id, name, website_url) VALUES (3, 'Udemy', 'https://www.udemy.com')`
        );
    } catch (err) {
        console.error(err.message);
    }
}

async function saveToDatabase(courses) {
    const query = `
        INSERT INTO courses 
        (title, description, external_id, url, language, level, provider_id, keywords, category, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            title = VALUES(title),
            description = VALUES(description),
            last_updated = VALUES(last_updated)
    `;

    for (const course of courses) {
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
                course.category,
                course.last_updated
            ]);
        } catch (err) {
            console.error(err.message);
        }
    }
}

exports.harvestMicrosoft = async () => {
    try {
        const filePath = path.join(__dirname, 'Data', 'microsoft_data.json');
        if (!fs.existsSync(filePath)) return;

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);
        const modules = data.modules || [];

        const normalized = modules.map(item => ({
            title: item.title,
            description: item.summary,
            external_id: item.uid,
            url: item.url,
            language: 'en',
            level: item.levels && item.levels.length > 0 ? item.levels[0] : 'Beginner',
            provider_id: 1,
            keywords: [...(item.roles || []), ...(item.products || [])].join(', '),
            category: item.products && item.products.length > 0 ? item.products[0] : 'General',
            last_updated: item.last_modified ? new Date(item.last_modified) : new Date()
        }));

        await saveToDatabase(normalized);
    } catch (err) {
        console.error(err.message);
    }
};

exports.harvestCoursera = async () => {
    try {
        const response = await axios.get('https://api.coursera.org/api/courses.v1', {
            params: {
                fields: 'description,primaryLanguages,difficultyLevel,slug',
                limit: 100
            }
        });

        const elements = response.data.elements || [];

        const normalized = elements.map(item => ({
            title: item.name,
            description: item.description || 'No description available',
            external_id: item.id,
            url: `https://www.coursera.org/learn/${item.slug}`,
            language: item.primaryLanguages ? item.primaryLanguages[0] : 'en',
            level: item.difficultyLevel || 'Beginner',
            provider_id: 2,
            keywords: 'MOOC, Online Course',
            category: 'General Education',
            last_updated: new Date()
        }));

        await saveToDatabase(normalized);
        return { success: true, count: elements.length };
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

exports.harvestUdemy = async () => {
    try {
        console.log("📡 Connecting to Mock CSV API (Port 4000)...");
        
        // Connect to your 'MockProvider' server
        const response = await axios.get('http://localhost:4000/api/courses');
        const data = response.data;

        console.log(`✅ Received ${data.length} courses from CSV API.`);

        const normalized = data.map((item, index) => {
            const subscriberCount = item.num_subscribers || '0';
            const duration = item.content_duration ? `${item.content_duration} hours` : 'various';
            const lectures = item.num_lectures || 'several';
            const subject = item.subject || 'General Topic';
            
            const smartDescription = `Join ${subscriberCount} students in this ${item.level || 'online'} course on ${subject}. Features ${duration} of content across ${lectures} lectures.`;

            return {
                title: item.course_title || "No Title",
                description: smartDescription, 
                external_id: item.course_id || `udemy-${index}`, 
                url: item.url || `http://localhost:4000/course/${index}`,
                language: 'en',
                level: item.level || 'All Levels',
                provider_id: 3, // ID 3 = Udemy
                keywords: item.subject || 'General',
                category: item.subject || 'Uncategorized',
                last_updated: item.published_timestamp ? new Date(item.published_timestamp) : new Date()
            };
        });

        await saveToDatabase(normalized);
        return { success: true, count: data.length };

    } catch (err) {
        console.error(" CSV Harvest Error:", err.message);
        return { error: err.message };
    }
};

const triggerSparkJob = () => {
    const scriptPath = path.join(__dirname, '..', 'Spark', 'ml_pipeline_ske.py');
    const pythonProcess = spawn('python3', [scriptPath], {
        cwd: path.join(__dirname, '..', 'Spark')
    });

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Spark Output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Spark Error: ${data}`);
    });
};

exports.syncAll = async () => {
    try {
        await ensureProvidersExist();
        await exports.harvestMicrosoft();
        await exports.harvestCoursera();
        await exports.harvestUdemy();
        triggerSparkJob();
        return { message: "Sync complete for all sources. Spark ML triggered." };
    } catch (err) {
        return { error: err.message };
    }
};