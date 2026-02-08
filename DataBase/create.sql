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
    external_id VARCHAR(100),
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

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,  
    email VARCHAR(255) NOT NULL UNIQUE,   
    hashed_password VARCHAR(255) NOT NULL
);

CREATE TABLE bookmarks (
    bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES courses(id) ON DELETE CASCADE
);

