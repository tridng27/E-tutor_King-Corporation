const express = require('express');
const { uploadImage } = require('../controllers/uploadController');
const { authenticateUser } = require('../Middleware/roleMiddleware');

const router = express.Router();

router.post('/image', authenticateUser, uploadImage);

module.exports = router;
