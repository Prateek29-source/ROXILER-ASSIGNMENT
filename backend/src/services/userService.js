const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { ValidationError, NotFoundError, ConflictError, DatabaseError } = require('../utils/errors');
const logger = require('../utils/logger');

class UserService {
  async createUser(userData) {
    const { name, email, address, password, role = 'USER' } = userData;

    try {
      logger.info(`Creating user: ${email}`);

      // Check if user already exists
      const [existingUser] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user into the database
      const sql = 'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)';
      const [result] = await db.query(sql, [name, email, address, hashedPassword, role.toUpperCase()]);

      logger.info(`User created successfully: ${email}`);
      return { id: result.insertId, name, email, address, role: role.toUpperCase() };

    } catch (error) {
      logger.error(`Error creating user: ${email}`, error);
      if (error instanceof ConflictError) throw error;
      throw new DatabaseError('Failed to create user');
    }
  }

  async getUserById(id) {
    try {
      const [users] = await db.query('SELECT id, name, email, address, role FROM users WHERE id = ?', [id]);

      if (users.length === 0) {
        throw new NotFoundError('User');
      }

      return users[0];
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to fetch user');
    }
  }

  async getAllUsers(filters = {}, pagination = {}) {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = filters;
    const { page = 1, limit = 10 } = pagination;

    const allowedSortBy = ['name', 'email', 'address', 'role', 'created_at'];
    const allowedSortOrder = ['ASC', 'DESC'];

    const orderBy = allowedSortBy.includes(sortBy) ? sortBy : 'name';
    const orderDirection = allowedSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    let sql = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             AVG(r.rating) as storeRating
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

    // Add pagination
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
      const [users] = await db.query(sql, params);

      // Get total count for pagination
      const countSql = `
        SELECT COUNT(*) as total FROM users u WHERE 1=1
        ${name ? ' AND u.name LIKE ?' : ''}
        ${email ? ' AND u.email LIKE ?' : ''}
        ${address ? ' AND u.address LIKE ?' : ''}
        ${role ? ' AND u.role = ?' : ''}
      `;
      const countParams = [name, email, address, role].filter(Boolean);
      const [countResult] = await db.query(countSql, countParams);

      const formattedUsers = users.map(user => ({
        ...user,
        storeRating: user.storeRating ? parseFloat(user.storeRating).toFixed(2) : null
      }));

      return {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError('Failed to fetch users');
    }
  }

  async updateUserPassword(userId, oldPassword, newPassword) {
    try {
      // Get the user's current hashed password from the DB
      const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        throw new NotFoundError('User');
      }
      const user = users[0];

      // Check if the old password matches
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new ValidationError('Incorrect old password');
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the password in the database
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

      logger.info(`Password updated for user ID: ${userId}`);
      return { message: 'Password updated successfully' };

    } catch (error) {
      logger.error(`Error updating password for user ID: ${userId}`, error);
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to update password');
    }
  }

  async authenticateUser(email, password) {
    try {
      // Check for user by email
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        throw new ValidationError('Invalid credentials');
      }

      const user = users[0];

      // Compare plain text password with hashed password from DB
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new ValidationError('Invalid credentials');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Authentication failed');
    }
  }
}

module.exports = new UserService();
