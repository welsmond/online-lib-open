const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { hashPassword, comparePassword } = require('../services/passwordService');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../services/tokenService');

const register = async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const password_hash = await hashPassword(password);
        const userId = uuidv4();

        await pool.query(
            'INSERT INTO users (id, username, email, password_hash, full_name) VALUES ($1, $2, $3, $4, $5)',
            [userId, username, email, password_hash, full_name || username]
        );

        const accessToken = generateAccessToken(userId, username, 'user');
        const refreshToken = generateRefreshToken(userId);

        res.status(201).json({
            message: 'User registered successfully',
            accessToken,
            refreshToken,
            user: { id: userId, username, email, full_name: full_name || username, role: 'user' }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const result = await pool.query(
            'SELECT id, username, email, password_hash, role FROM users WHERE email = $1 AND is_active = true',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows;
        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(user.id, user.username, user.role);
        const refreshToken = generateRefreshToken(user.id);

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const result = await pool.query(
            'SELECT id, username, role FROM users WHERE id = $1 AND is_active = true',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = result.rows;
        const accessToken = generateAccessToken(user.id, user.username, user.role);

        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Token refresh failed' });
    }
};

module.exports = { register, login, refreshToken };
