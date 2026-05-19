const express = require('express');
const { upload, uploadScan } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', upload.single('file'), uploadScan);

module.exports = router;
