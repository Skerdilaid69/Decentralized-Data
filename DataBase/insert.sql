INSERT INTO courses (title, description, language, level, source_name, source_url)
VALUES 
('Introduction to Spark', 'Learn large-scale data processing.', 'English', 'Beginner', 'Coursera', 'https://coursera.org'),
('Advanced React Hooks', 'Mastering the React front-end framework.', 'Greek', 'Advanced', 'Udemy', 'https://udemy.com');

UPDATE courses SET similar_ids = '2' WHERE id = 1;
UPDATE courses SET similar_ids = '1' WHERE id = 2;