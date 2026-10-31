const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'halal-finder-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token.' });
    }
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, country } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        
        // Check if user exists
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered.' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        
        // Insert user
        db.prepare(`
            INSERT INTO users (id, name, email, password, country, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).run(userId, name, email, hashedPassword, country || 'United Kingdom');
        
        // Generate token
        const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({ 
            message: 'Registration successful!',
            token,
            user: { id: userId, name, email, country: country || 'United Kingdom' }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        
        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        
        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ 
            message: 'Login successful!',
            token,
            user: { id: user.id, name: user.name, email: user.email, country: user.country }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT id, name, email, country FROM users WHERE id = ?').get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user data.' });
    }
});

// ==================== RESTAURANT ROUTES ====================

// Get all restaurants (with optional filters)
app.get('/api/restaurants', (req, res) => {
    try {
        const { country, city, cuisine, search, certification } = req.query;
        
        let query = 'SELECT * FROM restaurants WHERE 1=1';
        const params = [];
        
        if (country) {
            query += ' AND country LIKE ?';
            params.push(`%${country}%`);
        }
        if (city) {
            query += ' AND city LIKE ?';
            params.push(`%${city}%`);
        }
        if (cuisine) {
            query += ' AND cuisine LIKE ?';
            params.push(`%${cuisine}%`);
        }
        if (certification) {
            query += ' AND certification_body LIKE ?';
            params.push(`%${certification}%`);
        }
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ? OR cuisine LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY rating DESC, name ASC';
        
        const restaurants = db.prepare(query).all(...params);
        res.json({ restaurants });
    } catch (error) {
        console.error('Fetch restaurants error:', error);
        res.status(500).json({ error: 'Failed to fetch restaurants.' });
    }
});

// Get single restaurant
app.get('/api/restaurants/:id', (req, res) => {
    try {
        const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found.' });
        }
        res.json({ restaurant });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch restaurant.' });
    }
});

// Get unique countries from restaurants
app.get('/api/locations/countries', (req, res) => {
    try {
        const countries = db.prepare('SELECT DISTINCT country FROM restaurants ORDER BY country').all();
        res.json({ countries: countries.map(c => c.country) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch countries.' });
    }
});

// Get cities by country
app.get('/api/locations/cities/:country', (req, res) => {
    try {
        const cities = db.prepare('SELECT DISTINCT city FROM restaurants WHERE country = ? ORDER BY city').all(req.params.country);
        res.json({ cities: cities.map(c => c.city) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cities.' });
    }
});

// Get cuisines
app.get('/api/cuisines', (req, res) => {
    try {
        const cuisines = db.prepare('SELECT DISTINCT cuisine FROM restaurants ORDER BY cuisine').all();
        res.json({ cuisines: cuisines.map(c => c.cuisine) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cuisines.' });
    }
});

// ==================== PRODUCTS ROUTES ====================

// Get all products (with optional filters)
app.get('/api/products', (req, res) => {
    try {
        const { category, search, brand, certification, country } = req.query;
        
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        
        if (category) {
            query += ' AND category LIKE ?';
            params.push(`%${category}%`);
        }
        if (brand) {
            query += ' AND brand LIKE ?';
            params.push(`%${brand}%`);
        }
        if (certification) {
            query += ' AND certification_body LIKE ?';
            params.push(`%${certification}%`);
        }
        if (country) {
            query += ' AND available_countries LIKE ?';
            params.push(`%${country}%`);
        }
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY name ASC';
        
        const products = db.prepare(query).all(...params);
        res.json({ products });
    } catch (error) {
        console.error('Fetch products error:', error);
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json({ product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product.' });
    }
});

// Get product categories
app.get('/api/categories', (req, res) => {
    try {
        const categories = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all();
        res.json({ categories: categories.map(c => c.category) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});

// ==================== FAVORITES ROUTES ====================

// Get user's favorites
app.get('/api/favorites', authenticateToken, (req, res) => {
    try {
        const favorites = db.prepare(`
            SELECT f.*, 
                   r.name as restaurant_name, r.city as restaurant_city, r.cuisine as restaurant_cuisine,
                   p.name as product_name, p.brand as product_brand
            FROM favorites f
            LEFT JOIN restaurants r ON f.restaurant_id = r.id
            LEFT JOIN products p ON f.product_id = p.id
            WHERE f.user_id = ?
        `).all(req.user.id);
        res.json({ favorites });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch favorites.' });
    }
});

// Add to favorites
app.post('/api/favorites', authenticateToken, (req, res) => {
    try {
        const { restaurant_id, product_id } = req.body;
        const favoriteId = uuidv4();
        
        db.prepare(`
            INSERT INTO favorites (id, user_id, restaurant_id, product_id, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `).run(favoriteId, req.user.id, restaurant_id || null, product_id || null);
        
        res.status(201).json({ message: 'Added to favorites!', id: favoriteId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to favorites.' });
    }
});

// Remove from favorites
app.delete('/api/favorites/:id', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        res.json({ message: 'Removed from favorites.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove from favorites.' });
    }
});

// ==================== CERTIFICATION BODIES ====================

app.get('/api/certifications', (req, res) => {
    try {
        const certifications = db.prepare('SELECT * FROM certification_bodies ORDER BY name').all();
        res.json({ certifications });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch certifications.' });
    }
});

// Serve the main page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🥙 Halal Finder Server running at http://localhost:${PORT}\n`);
});
