const Book = require('../models/Book');

// Add a new book (Admin functionality)
exports.addBook = async (req, res) => {
    try {
        const { title, description, price, pdfUrl, coverImage } = req.body;
        const newBook = new Book({ title, description, price, pdfUrl, coverImage });
        await newBook.save();
        res.status(201).json({ message: "Book added successfully", book: newBook });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all books
exports.getBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single book
exports.getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};