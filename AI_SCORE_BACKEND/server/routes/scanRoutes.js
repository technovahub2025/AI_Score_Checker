const express = require('express');
const { createScan, getScanById } = require('../controllers/scanController');

const router = express.Router();

router.post('/scan', createScan);
router.get('/scan/:id', getScanById);

module.exports = router;
