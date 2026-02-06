const express = require('express');
const router = express.Router();
const courseController = require('./controller');

router.get('/courses', courseController.getCourses);
router.get('/courses/:id', courseController.getCourseById);

module.exports = router;