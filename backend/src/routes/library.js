const express = require('express');
const {
    addBookToLibrary,
    removeBookFromLibrary,
    addToFavorites,
    addReview,
    getMyLibrary
} = require('../controllers/libraryController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/my', getMyLibrary);
router.post('/add', addBookToLibrary);
router.delete('/:book_id', removeBookFromLibrary);
router.post('/favorite', addToFavorites);
router.post('/review', addReview);

module.exports = router;
