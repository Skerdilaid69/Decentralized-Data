const fs = require('fs');
const path = require('path');
const db = require('./db');

// --- HELPER 1: Ensure Provider Exists (Run this ONCE, not in the loop) ---
async function ensureProviderExists() {
    try {
        // We use ID 1 for Microsoft as you requested
        await db.query(
            `INSERT IGNORE INTO providers (id, name, website_url) VALUES (1, 'Microsoft Learn', 'https://learn.microsoft.com')`
        );
        console.log(`✅ Provider "Microsoft Learn" (ID: 1) verified.`);
    } catch (err) {
        console.error(`❌ Failed to verify provider:`, err.message);
    }
}

// --- HELPER 2: Save to DB ---
async function saveCoursesToDB(courses) {
    console.log(`Starting import of ${courses.length} courses...`);
    let newCount = 0;
    let updateCount = 0;

    for (const course of courses) {
        // Ensure date is valid
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
            const [result] = await db.query(query, [
                course.title, 
                course.description, 
                course.external_id, 
                course.url, 
                course.language, 
                course.level, 
                course.provider_id, // This will be 1
                course.keywords,
                safeDate
            ]);

            if (result.affectedRows === 1) newCount++;
            else if (result.affectedRows === 2) updateCount++;
        } catch (err) {
            console.error(`Failed to save course "${course.title}":`, err.message);
        }
    }
    console.log(`Sync Complete: ${newCount} new, ${updateCount} updated.`);
}

// --- CONNECTOR: Microsoft Learn ---
exports.harvestMicrosoft = async () => {
    try {
        console.log("Reading Microsoft Data file...");
        
        // 1. CRITICAL: Create the provider FIRST (before processing courses)
        await ensureProviderExists();

        // 2. Read File
        const filePath = path.join(__dirname, 'data', 'microsoft_data.json');
        
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found! Please download https://learn.microsoft.com/api/catalog/ to BackEnd/data/microsoft_data.json");
        }

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);
        const modules = data.modules || [];

        console.log(`Found ${modules.length} modules. Transforming...`);

        // 3. Transform Data
        const normalizedCourses = modules.map(item => {
            const keywordList = [
                ...(item.roles || []), 
                ...(item.products || [])
            ].join(', ');

            return {
                title: item.title,
                description: item.summary,
                external_id: item.uid,
                url: item.url,
                language: 'en',
                level: item.levels && item.levels.length > 0 ? item.levels[0] : 'Beginner',
                provider_id: 1, // <--- SET TO 1 AS REQUESTED
                keywords: keywordList,
                last_updated: item.last_modified
            };
        });

        // 4. Save to DB
        await saveCoursesToDB(normalizedCourses);
        return { message: "Microsoft Sync Successful!" };

    } catch (err) {
        console.error("Error harvesting Microsoft:", err);
        return { error: err.message };
    }
};

// --- INITIALIZATION ---
exports.initializeDatabase = async () => {
    try {
        console.log("Checking database status...");
        const [rows] = await db.query('SELECT COUNT(*) as count FROM courses');
        
        if (rows[0].count === 0) {
            console.log("Database is empty. Starting Automatic Import...");
            await exports.harvestMicrosoft(); 
            console.log("Automatic Import Complete!");
        } else {
            console.log(`Database already contains ${rows[0].count} courses. Skipping Import.`);
        }
    } catch (err) {
        console.error("Error during automatic initialization:", err.message);
    }
};