const express = require("express")
const router = express.Router()
const Book = require('../models/book')

router.get('/', async (req, res) => {
    //Ordering our books according to the dates so that the recently added books can be viewed
    let books = []
    try {
        books = await Book.find().sort({ createdAt: 'desc'}).limit(10).exec()

    } catch {
        books = []
    }
    // Passing the object using the books variable
    res.render("index", { books: books});
})

module.exports = router