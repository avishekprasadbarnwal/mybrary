const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require('path')

//importing the filesystem inside the app to manage the files easily
const fs = require('fs')

const Book = require('../models/book')

// importing the coverImageBasePath from the book.js inside the models folder
const uploadPath = path.join('public', Book.coverImageBasePath)

//Importing the Author model
const Author = require('../models/author')

//Implementing multer in our project and giving its destination i.e where it will be saved 
const imageMimeTypes = ['image/jpeg', 'image/gif', 'image/png']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})


//for all books route
router.get('/', async (req, res) => {
        let query = Book.find()
        if (req.query.title != null && req.query.title != '' ){
            query = query.regex('title', new RegExp(req.query.title, 'i'))
        }
        if (req.query.publishedBefore != null && req.query.publishedBefore != '' ){
            query = query.lte('publishDate', req.query.publishedBefore)
            //here lte stands for lessthan or equalto 
        }
        if (req.query.publishedAfter != null && req.query.publishedAfter != '' ){
            query = query.gte('publishDate', req.query.publishedAfter)
            //here lte stands for lessthan or equalto 
        }
        try{
            const books = await query.exec()
            res.render('books/index', {
                books: books,
                searchOptions: req.query
            })
     // Here the books that is passed inside the books which is the list of books that we want to create
     // and the second is the searchParams which is used for the purpose of searching the books

        } catch {
            res.redirect('/')
        }
})

// for new book Route
router.get('/new' , async (req, res) => {
    renderNewPage(res, new Book())
})

// for creating a new book route
router.post('/', upload.single('cover'), async(req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book ({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    try{

        const newBook = await book.save()
        //res.redirect(`books/${newBook.id}`)
        res.redirect('books')

    } catch {
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
     
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false) {
    try{ 
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Books'
        res.render('books/new', params)
    } catch {
        res.redirect('/books')
    }
}

module.exports = router