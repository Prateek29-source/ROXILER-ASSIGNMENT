const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../utils/jwtHelper');

//   Register a new user (Normal User role by default)
exports.registerUser = async (req, res) => {
    const { name, email, address, password } = req.body;

    try {
        // Check if user already exists
        const [userExists] = await db.query('SELECT email FROM users WHERE email = ?', [email]);

        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into the database
        const sql = 'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)';
        await db.query(sql, [name, email, address, hashedPassword, 'USER']);

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

//   Authenticate user & get token
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        // Check for user by email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Compare plain text password with hashed password from DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // User is authenticated, generate a JWT
        const token = generateToken(user.id, user.role);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Register a new store owner and their store
exports.registerStoreOwner = async (req, res) => {
    const { name, email, address, password, storeName, storeAddress, storeEmail } = req.body;

    // Basic validation
    if (!name || !email || !password || !storeName || !storeAddress || !storeEmail) {
        return res.status(400).json({ message: 'Please provide all required fields for user and store.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check if user or store email already exists
        const [userExists] = await connection.query('SELECT email FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            throw new Error('User with this email already exists');
        }

        const [storeExists] = await connection.query('SELECT email FROM stores WHERE email = ?', [storeEmail]);
        if (storeExists.length > 0) {
            throw new Error('A store with this email already exists.');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user with STORE_OWNER role
        const userSql = 'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)';
        const [userResult] = await connection.query(userSql, [name, email, address, hashedPassword, 'STORE_OWNER']);
        const newUserId = userResult.insertId;

        // Insert the new store and assign the new user as its owner
        const storeSql = 'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)';
        await connection.query(storeSql, [storeName, storeEmail, storeAddress, newUserId]);

        await connection.commit();
        res.status(201).json({ message: 'Store owner and store registered successfully!' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error during store owner registration' });
    } finally {
        connection.release();
    }
};
