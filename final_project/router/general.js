const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // ⬅️ Required for async tasks


// Register endpoint
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


// Original GET routes
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4)); 
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let matchingBooks = [];

  for (let key in books) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push(books[key]);
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  let matchingBooks = [];

  for (let key in books) {
    if (books[key].title.toLowerCase() === title) {
      matchingBooks.push(books[key]);
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No book found with this title" });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found with the given ISBN" });
  }
});


//  Task 10 — Async: Get all books
public_users.get('/async-books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

//  Task 11 — Async: Get book by ISBN
public_users.get('/async-isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: 'Book not found by ISBN', error: error.message });
  }
});

//  Task 12 — Async: Get books by author
public_users.get('/async-author/:author', async (req, res) => {
  const { author } = req.params;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: 'Book not found by author', error: error.message });
  }
});

//  Task 13 — Async: Get books by title
public_users.get('/async-title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: 'Book not found by title', error: error.message });
  }
});


module.exports.general = public_users;
