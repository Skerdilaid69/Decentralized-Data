const express = require('express');
const router = express.Router();
const courseController = require('./controllers');

router.get('/courses', courseController.getCourses);
router.get('/courses/:id', courseController.getCourseById);
router.get('/sync/:source', courseController.syncProvider);

module.exports = router;