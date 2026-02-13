const express = require('express');
const router = express.Router();
const courseController = require('./controllers');
const { authenticateToken } = require('./middleware');

router.get('/courses', courseController.getCourses);
router.get('/courses/:id', courseController.getCourseById);
router.get('/sync/all', courseController.syncProvider);
router.get('/courses/:id/similar', courseController.getRecommendations);
router.get('/analytics', courseController.getAnalytics);

router.post('/register', courseController.register);
router.post('/login', courseController.login);

router.post('/bookmarks', authenticateToken, courseController.toggleBookmark); 
router.post('/history', authenticateToken, courseController.addToHistory);   
router.get('/bookmarks/:courseId', authenticateToken, courseController.checkBookmark); 

router.get('/bookmarks', authenticateToken, courseController.getBookmarks);
router.get('/history', authenticateToken, courseController.getHistory);

module.exports = router;