const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    merchantRequestID: String,
    checkoutRequestID: String,
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    mpesaReceiptNumber: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);