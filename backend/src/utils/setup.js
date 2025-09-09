const bcrypt = require('bcryptjs');
const db = require('../config/db');

const createDefaultAdmin = async () => {
    try {
        // Check if an admin user already exists
        const [admins] = await db.query("SELECT id FROM users WHERE role = 'ADMIN'");

        if (admins.length === 0) {
            console.log('No admin user found. Creating default admin...');
            
            const name = 'Admin User';
            const email = 'admin@example.com';
            const address = '123 Admin Street';
            const password = 'Password123!'; // Default password
            const role = 'ADMIN';

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const sql = 'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)';
            await db.query(sql, [name, email, address, hashedPassword, role]);

            console.log('*****************************************************');
            console.log('Default admin user created successfully!');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log('Please change this password after your first login.');
            console.log('*****************************************************');
        }
    } catch (error) {
        console.error('Error during initial setup:', error);
    }
};

module.exports = createDefaultAdmin;
