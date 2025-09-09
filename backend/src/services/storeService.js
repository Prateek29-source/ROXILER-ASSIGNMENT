const db = require('../config/db');
const { ValidationError, NotFoundError, ConflictError, DatabaseError } = require('../utils/errors');
const logger = require('../utils/logger');

class StoreService {
  async createStore(storeData) {
    const { name, email, address, owner_id } = storeData;

    try {
      logger.info(`Creating store: ${name}`);

      // Optional: Check if the owner_id is valid and belongs to a STORE_OWNER
      if (owner_id) {
        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [owner_id]);
        if (users.length === 0 || users[0].role !== 'STORE_OWNER') {
          throw new ValidationError('Invalid owner ID or the user is not a Store Owner');
        }
      }

      const sql = 'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)';
      const [result] = await db.query(sql, [name, email, address, owner_id || null]);

      logger.info(`Store created successfully: ${name}`);
      return { id: result.insertId, name, email, address, owner_id };

    } catch (error) {
      logger.error(`Error creating store: ${name}`, error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('A store with this email already exists');
      }
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Failed to create store');
    }
  }

  async getAllStores(filters = {}, userId) {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = filters;

    const allowedSortBy = ['name', 'address', 'overallRating'];
    const allowedSortOrder = ['ASC', 'DESC'];

    const orderBy = allowedSortBy.includes(sortBy) ? sortBy : 'name';
    const orderDirection = allowedSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    try {
      let sql = `
        SELECT
          s.id,
          s.name,
          s.address,
          s.email,
          AVG(r.rating) as overallRating,
          (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as userSubmittedRating
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE 1=1
      `;

      const params = [userId];

      if (name) {
        sql += ' AND s.name LIKE ?';
        params.push(`%${name}%`);
      }
      if (address) {
        sql += ' AND s.address LIKE ?';
        params.push(`%${address}%`);
      }

      sql += ` GROUP BY s.id ORDER BY ${orderBy} ${orderDirection}`;

      const [stores] = await db.query(sql, params);

      // Clean up the data (convert nulls and format numbers)
      const formattedStores = stores.map(store => ({
        ...store,
        overallRating: store.overallRating ? parseFloat(store.overallRating).toFixed(2) : 'N/A',
        userSubmittedRating: store.userSubmittedRating || null
      }));

      return formattedStores;

    } catch (error) {
      throw new DatabaseError('Failed to fetch stores');
    }
  }

  async submitOrUpdateRating(storeId, userId, rating) {
    try {
      logger.info(`Submitting rating for store ${storeId} by user ${userId}`);

      // Check if store exists
      const [stores] = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
      if (stores.length === 0) {
        throw new NotFoundError('Store');
      }

      // This query will INSERT a new rating, or if a rating from this user
      // for this store already exists, it will UPDATE the existing one.
      const sql = `
        INSERT INTO ratings (user_id, store_id, rating)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = ?, updated_at = CURRENT_TIMESTAMP
      `;

      await db.query(sql, [userId, storeId, rating, rating]);

      logger.info(`Rating submitted successfully for store ${storeId} by user ${userId}`);
      return { message: 'Rating submitted successfully' };

    } catch (error) {
      logger.error(`Error submitting rating for store ${storeId} by user ${userId}`, error);
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to submit rating');
    }
  }

  async getStoreOwnerDashboard(ownerId) {
    try {
      // First, find the store owned by the logged-in user
      const [stores] = await db.query('SELECT id FROM stores WHERE owner_id = ?', [ownerId]);

      if (stores.length === 0) {
        throw new NotFoundError('Store owned by this user');
      }
      const storeId = stores[0].id;

      // Get the average rating for the store
      const [avgRatingResult] = await db.query(
        'SELECT AVG(rating) as averageRating FROM ratings WHERE store_id = ?',
        [storeId]
      );
      const averageRating = avgRatingResult[0].averageRating;

      // Get the list of users who have rated the store
      const [raters] = await db.query(`
        SELECT u.name, u.email, r.rating, r.updated_at
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = ?
        ORDER BY r.updated_at DESC
      `, [storeId]);

      return {
        averageRating: averageRating ? parseFloat(averageRating).toFixed(2) : 'N/A',
        raters: raters
      };

    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to fetch store dashboard');
    }
  }

  async getDashboardStats() {
    try {
      const [userCount] = await db.query('SELECT COUNT(*) as total FROM users');
      const [storeCount] = await db.query('SELECT COUNT(*) as total FROM stores');
      const [ratingCount] = await db.query('SELECT COUNT(*) as total FROM ratings');

      return {
        totalUsers: userCount[0].total,
        totalStores: storeCount[0].total,
        totalRatings: ratingCount[0].total,
      };

    } catch (error) {
      throw new DatabaseError('Failed to fetch dashboard stats');
    }
  }
}

module.exports = new StoreService();
