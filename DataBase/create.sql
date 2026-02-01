DROP DATABASE IF EXISTS course_aggregator;
CREATE DATABASE course_aggregator;
USE course_aggregator;

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,            
    description TEXT,                      
    category VARCHAR(100),                  
    language VARCHAR(50),           
    level VARCHAR(50),                
    source_name VARCHAR(100),            
    source_url VARCHAR(255),             
    registration_link VARCHAR(255),        
    last_updated DATETIME,               

    cluster_id INT DEFAULT NULL,
    similar_ids TEXT DEFAULT NULL
);