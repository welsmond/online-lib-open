const express = require('express');
const { getAllBooks, getBookById, createBook } = require('../controllers/bookController');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', adminMiddleware, createBook);

module.exports = router;
