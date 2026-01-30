const pool = require('../config/database');

const getAllBooks = async (req, res) => {
    try {
        const { genre, author, search, sort = 'created_at', order = 'DESC', page = '1', limit = '20' } = req.query;
        
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const offset = (pageNum - 1) * limitNum;

        let query = 'SELECT * FROM books WHERE 1=1';
        const params = [];

        if (genre && genre.trim()) {
            query += ` AND genre ILIKE $${params.length + 1}`;
            params.push(`%${genre}%`);
        }

        if (author && author.trim()) {
            query += ` AND author ILIKE $${params.length + 1}`;
            params.push(`%${author}%`);
        }

        if (search && search.trim()) {
            query += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 2})`;
            params.push(`%${search}%`, `%${search}%`);
        }

        const validSortFields = ['created_at', 'title', 'author', 'publication_date'];
        const sortField = validSortFields.includes(sort) ? sort : 'created_at';
        const validOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

        query += ` ORDER BY ${sortField} ${validOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limitNum, offset);

        const result = await pool.query(query, params);

        let countQuery = 'SELECT COUNT(*) as total FROM books WHERE 1=1';
        const countParams = [];

        if (genre && genre.trim()) {
            countQuery += ` AND genre ILIKE $${countParams.length + 1}`;
            countParams.push(`%${genre}%`);
        }
        if (author && author.trim()) {
            countQuery += ` AND author ILIKE $${countParams.length + 1}`;
            countParams.push(`%${author}%`);
        }
        if (search && search.trim()) {
            countQuery += ` AND (title ILIKE $${countParams.length + 1} OR description ILIKE $${countParams.length + 2})`;
            countParams.push(`%${search}%`, `%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows.total);

        res.json({
            data: result.rows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
};

const getBookById = async (req, res) => {
    try {
        const { id } = req.params;

        const bookResult = await pool.query(
            'SELECT * FROM books WHERE id = $1',
            [id]
        );

        if (bookResult.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const audioResult = await pool.query(
            'SELECT id, narrator, duration_seconds, file_size_mb, bitrate FROM audiobooks WHERE book_id = $1',
            [id]
        );

        res.json({
            book: bookResult.rows,
            audiobooks: audioResult.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
};

const createBook = async (req, res) => {
    try {
        const { title, author, description, genre, isbn, cover_image_url, publication_date } = req.body;

        if (!title || !author) {
            return res.status(400).json({ error: 'Title and author are required' });
        }

        const result = await pool.query(
            'INSERT INTO books (title, author, description, genre, isbn, cover_image_url, publication_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, author, description, genre, isbn, cover_image_url, publication_date]
        );

        res.status(201).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create book' });
    }
};

module.exports = { getAllBooks, getBookById, createBook };
