// MockProvider/mock_server.js
const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const cors = require("cors"); 

const app = express();
const PORT = 4000; 

app.use(cors()); // Allow your main backend to talk to this server

let courses = [];

// 1. Read the CSV file immediately when the server starts
fs.createReadStream("courses.csv") 
  .pipe(csv())
  .on("data", (row) => {
    const cleanRow = {};
    Object.keys(row).forEach(key => {
        cleanRow[key.trim()] = row[key].trim();
    });
    courses.push(cleanRow);
  })
  .on("end", () => {
    console.log(` CSV Loaded! Found ${courses.length} courses ready to serve.`);
  });

// 2. Create the API Endpoint
app.get("/api/courses", (req, res) => {
  console.log(" Generating data for incoming request...");
  res.json(courses);
});

// 3. Start the Server
app.listen(PORT, () => {
  console.log(`Mock API Server running on http://localhost:${PORT}`);
});