DROP DATABASE IF EXISTS course_aggregator;
CREATE DATABASE course_aggregator;
USE course_aggregator;

CREATE TABLE providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    api_endpoint VARCHAR(255), 
    website_url VARCHAR(255)
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT,
    external_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    keywords TEXT, 
    category TEXT,
    language VARCHAR(50),
    level VARCHAR(50),
    url VARCHAR(500),
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cluster_id INT, 
    FOREIGN KEY (provider_id) REFERENCES providers(id),	
    UNIQUE KEY unique_course_url (url)
);
CREATE TABLE course_recommendations (
    course_id INT,
    recommended_course_id INT,
    similarity_score FLOAT,
    PRIMARY KEY (course_id, recommended_course_id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (recommended_course_id) REFERENCES courses(id)
);