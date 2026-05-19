const express = require('express');
const { createScan, getScanById, getHistory } = require('../controllers/scanController');

const router = express.Router();

router.post('/scan', createScan);
router.get('/scan/:id', getScanById);
router.get('/history', getHistory);

module.exports = router;
