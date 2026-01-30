require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const audiobookRoutes = require('./routes/audiobooks');
const libraryRoutes = require('./routes/library');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/audiobooks', audiobookRoutes);
app.use('/api/library', libraryRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
