const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const uploadAudiobook = async (req, res) => {
    try {
        const { book_id, narrator, duration_seconds, bitrate } = req.body;

        if (!book_id || !req.file) {
            return res.status(400).json({ error: 'book_id and audio file are required' });
        }

        const durationSeconds = parseInt(duration_seconds) || 0;
        if (isNaN(durationSeconds) || durationSeconds <= 0) {
            return res.status(400).json({ error: 'Invalid duration' });
        }

        const fileSizeMb = (req.file.size / (1024 * 1024)).toFixed(2);
        const fileName = `${uuidv4()}${path.extname(req.file.originalname)}`;
        const fileUrl = `/uploads/${fileName}`;

        const result = await pool.query(
            'INSERT INTO audiobooks (book_id, narrator, duration_seconds, file_url, file_size_mb, bitrate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [book_id, narrator || null, durationSeconds, fileUrl, fileSizeMb, bitrate || null]
        );

        res.status(201).json({
            message: 'Audiobook uploaded successfully',
            audiobook: result.rows
        });
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to upload audiobook' });
    }
};

const getAudiobookStream = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM audiobooks WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Audiobook not found' });
        }

        const audiobook = result.rows;
        const filePath = path.join(__dirname, '../../', audiobook.file_url);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Audio file not found' });
        }

        const fileSize = fs.statSync(filePath).size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts, 10);
            const end = parts ? parseInt(parts, 10) : fileSize - 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': end - start + 1,
                'Content-Type': 'audio/mpeg'
            });

            fs.createReadStream(filePath, { start, end }).pipe(res);
        } else {
            res.header('Content-Length', fileSize);
            res.header('Content-Type', 'audio/mpeg');
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to stream audiobook' });
    }
};

module.exports = { uploadAudiobook, getAudiobookStream };
