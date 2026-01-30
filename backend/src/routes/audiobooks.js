const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadAudiobook, getAudiobookStream } = require('../controllers/audiobookController');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid audio format'));
        }
    }
});

router.post('/upload', adminMiddleware, upload.single('audio'), uploadAudiobook);
router.get('/:id/stream', authMiddleware, getAudiobookStream);

module.exports = router;
