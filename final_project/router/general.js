const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Helper function to simulate asynchronous data fetching
const fetchBooks = () => Promise.resolve(books);


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "User already exists!" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered. Now you can login" });
});


public_users.get('/', async (req, res) => {
    try {
        const allBooks = await fetchBooks();
        return res.status(200).json(allBooks);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list" });
    }
});


public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const allBooks = await fetchBooks();
        const book = allBooks[isbn];
        if (book) {
            return res.status(200).json(book);
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});


public_users.get('/author/:author', async (req, res) => {
    const authorName = req.params.author;
    try {
        const allBooks = await fetchBooks();
        // Convert the books object to an array and apply filter
        const filteredBooks = Object.values(allBooks).filter(book => book.author === authorName);
        
        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks);
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error filtering by author" });
    }
});

public_users.get('/title/:title', async (req, res) => {
    const titleName = req.params.title;
    try {
        const allBooks = await fetchBooks();
        // Convert the books object to an array and apply filter
        const filteredBooks = Object.values(allBooks).filter(book => book.title === titleName);

        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks);
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error filtering by title" });
    }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;