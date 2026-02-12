const express = require('express');
const router = express.Router();
const courseController = require('./controllers');

router.get('/courses', courseController.getCourses);
router.get('/courses/:id', courseController.getCourseById);
router.get('/sync/all', courseController.syncProvider);
router.get('/courses/:id/similar', courseController.getRecommendations);
router.get('/analytics', courseController.getAnalytics);

module.exports = router;