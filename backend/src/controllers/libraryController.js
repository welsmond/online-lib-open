const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const addBookToLibrary = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { book_id } = req.body;

        if (!book_id) {
            return res.status(400).json({ error: 'book_id is required' });
        }

        const existingEntry = await pool.query(
            'SELECT id FROM user_library WHERE user_id = $1 AND book_id = $2',
            [userId, book_id]
        );

        if (existingEntry.rows.length > 0) {
            return res.status(400).json({ error: 'Book already in library' });
        }

        await pool.query(
            'INSERT INTO user_library (user_id, book_id) VALUES ($1, $2)',
            [userId, book_id]
        );

        res.status(201).json({ message: 'Book added to library successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add book to library' });
    }
};

const removeBookFromLibrary = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { book_id } = req.params;

        await pool.query(
            'DELETE FROM user_library WHERE user_id = $1 AND book_id = $2',
            [userId, book_id]
        );

        res.json({ message: 'Book removed from library' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove book from library' });
    }
};

const addToFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { book_id, isFavorite } = req.body;

        await pool.query(
            'UPDATE user_library SET is_favorite = $1 WHERE user_id = $2 AND book_id = $3',
            [isFavorite, userId, book_id]
        );

        res.json({ message: 'Favorite status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update favorite' });
    }
};

const addReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { book_id, rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        await pool.query(
            'UPDATE user_library SET rating = $1, review = $2 WHERE user_id = $3 AND book_id = $4',
            [rating, review || null, userId, book_id]
        );

        res.json({ message: 'Review added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add review' });
    }
};

const getMyLibrary = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT b.*, ul.is_favorite, ul.rating, ul.review, ul.added_at
             FROM books b
             JOIN user_library ul ON b.id = ul.book_id
             WHERE ul.user_id = $1
             ORDER BY ul.added_at DESC`,
            [userId]
        );

        res.json({ books: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch library' });
    }
};

module.exports = { addBookToLibrary, removeBookFromLibrary, addToFavorites, addReview, getMyLibrary };
