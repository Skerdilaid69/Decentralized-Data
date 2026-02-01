const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Albania100$', 
  database: 'course_aggregator',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool.promise();