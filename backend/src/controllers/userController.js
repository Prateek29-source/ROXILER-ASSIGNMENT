const bcrypt = require('bcryptjs');
const db = require('../config/db');

//  Admin creates a new user (can be ADMIN, USER, or STORE_OWNER)
exports.createUserByAdmin = async (req, res) => {
    const { name, email, password, address, role } = req.body;

    try {
        const [userExists] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)';
        await db.query(sql, [name, email, hashedPassword, address, role.toUpperCase()]);

        res.status(201).json({ message: `User with role ${role.toUpperCase()} created successfully` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating user' });
    }
};

//  Admin gets all users with filtering
exports.getAllUsersByAdmin = async (req, res) => {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortBy = ['name', 'email', 'address', 'role', 'storeRating'];
    const allowedSortOrder = ['ASC', 'DESC'];

    const orderBy = allowedSortBy.includes(sortBy) ? sortBy : 'name';
    const orderDirection = allowedSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    let sql = `
        SELECT u.id, u.name, u.email, u.address, u.role, AVG(r.rating) as storeRating
        FROM users u
        LEFT JOIN stores s ON u.id = s.owner_id
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE 1=1
    `;
    const params = [];

    if (name) {
        sql += ' AND u.name LIKE ?';
        params.push(`%${name}%`);
    }
    if (email) {
        sql += ' AND u.email LIKE ?';
        params.push(`%${email}%`);
    }
    if (address) {
        sql += ' AND u.address LIKE ?';
        params.push(`%${address}%`);
    }
    if (role) {
        sql += ' AND u.role = ?';
        params.push(role);
    }

    sql += ` GROUP BY u.id ORDER BY ${orderBy} ${orderDirection}`;

    try {
        const [users] = await db.query(sql, params);
        const formattedUsers = users.map(user => ({
            ...user,
            storeRating: user.storeRating ? parseFloat(user.storeRating).toFixed(2) : null
        }));
        res.json(formattedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};

//  Admin gets a single user's details
exports.getUserByIdByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.query('SELECT id, name, email, address, role FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching user details' });
    }
};

//  User updates their own password
exports.updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // Get the user's current hashed password from the DB
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const user = users[0];

        // Check if the old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating password.' });
    }
};
