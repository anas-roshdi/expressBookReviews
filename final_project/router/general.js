const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  const username = req.body.username;  
  const password = req.body.password;
  if (username && password) {
    const exists = users.filter((user) => user.username === username);
    if (exists.length === 0) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user: Username and/or Password not provided." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const getBooks = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("Books not found");
      }
    });

    const bookList = await getBooks;
    return res.status(200).json(bookList);
    
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const findBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });
  findBook
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((err) => {
      res.status(err.status || 500).json({ message: err.message });
    });
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const findBooksByAuthor = new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      const filteredBooks = keys
        .filter(key => books[key].author === author)
        .map(key => ({ isbn: key, ...books[key] }));

      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found for this author");
      }
    });
    const result = await findBooksByAuthor;
    return res.status(200).json(result);

  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const findByTitle = new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      const filteredBooks = keys
        .filter(key => books[key].title === title)
        .map(key => ({ isbn: key, ...books[key] }));

      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found with this title");
      }
    });

    const result = await findByTitle;
    return res.status(200).json(result);

  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


module.exports.general = public_users;
