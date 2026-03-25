const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    pdfUrl: {
        type: String, // Link to the PDF (e.g., Cloudinary or AWS S3 link)
        required: true
    },
    coverImage: {
        type: String, // Link to cover image
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', bookSchema);