// Type definitions for the Store Rating Application
// These serve as documentation for expected data structures

/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {string} address - User's address
 * @property {string} role - User role (ADMIN, USER, STORE_OWNER)
 * @property {string} [password] - Hashed password (only for internal use)
 * @property {string} [created_at] - Account creation timestamp
 */

/**
 * @typedef {Object} Store
 * @property {number} id - Store ID
 * @property {string} name - Store name
 * @property {string} email - Store email
 * @property {string} address - Store address
 * @property {number|null} owner_id - ID of store owner (null if no owner)
 * @property {string} [created_at] - Store creation timestamp
 */

/**
 * @typedef {Object} Rating
 * @property {number} id - Rating ID
 * @property {number} user_id - ID of user who submitted rating
 * @property {number} store_id - ID of rated store
 * @property {number} rating - Rating value (1-5)
 * @property {string} [created_at] - Rating creation timestamp
 * @property {string} [updated_at] - Rating update timestamp
 */

/**
 * @typedef {Object} AuthToken
 * @property {Object} user - User information from JWT
 * @property {number} user.id - User ID
 * @property {string} user.role - User role
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Response success status
 * @property {string} [message] - Response message
 * @property {*} [data] - Response data
 * @property {Object} [pagination] - Pagination info (if applicable)
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - Field that failed validation
 * @property {string} message - Error message
 * @property {string} [value] - Invalid value
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} [page] - Current page number
 * @property {number} [limit] - Items per page
 * @property {number} [total] - Total number of items
 * @property {number} [totalPages] - Total number of pages
 */

module.exports = {};
