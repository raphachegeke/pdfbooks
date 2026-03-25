const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/status/:id', paymentController.checkStatus); // Add this line
router.post('/initiate', paymentController.initiatePayment);
router.post('/callback', paymentController.mpesaCallback); // M-Pesa calls this

module.exports = router;