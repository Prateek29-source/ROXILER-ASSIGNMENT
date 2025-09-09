# Store-Rating-App-Roxiler (Full-Stack Application)

A complete, full-stack web application that allows users to submit and view ratings for stores. The platform features a robust role-based access control (RBAC) system, providing tailored experiences for Normal Users, Store Owners, and System Administrators.

This project is built with a modern, decoupled architecture, featuring a Node.js/Express.js backend API and a React.js single-page application (SPA) frontend.

## 📖 Table of Contents

*   [✨ Features](#-features)
*   [🏗️ Architecture & Project Structure](#️-architecture--project-structure)
*   [🚀 Tech Stack](#-tech-stack)
*   [📋 Prerequisites](#-prerequisites)
*   [⚙️ Installation & Setup](#️-installation--setup)
*   [📜 Available Scripts](#-available-scripts)
*   [🔐 API Endpoints](#-api-endpoints)

## ✨ Features

### 👤 Normal User

*   **User Authentication**: Secure signup and login functionality.
*   **Store Discovery**: View a list of all registered stores with their average ratings.
*   **Search & Filter**: Find stores by name or address.
*   **Rating System**: Submit or update a rating from 1 to 5 for any store.
*   **View Own Ratings**: See previously submitted ratings on the store list.
*   **Password Management**: Ability to update their own password after logging in.

### 🏪 Store Owner

*   **Secure Login**: Access a dedicated, protected dashboard.
*   **Performance Metrics**: View the overall average rating for their specific store.
*   **Customer Insights**: See a list of all users who have submitted a rating for their store, including the rating and date.
*   **Password Management**: Ability to update their own password.

### 🛠️ System Administrator

*   **Secure Login**: Access a comprehensive admin dashboard.
*   **Platform Analytics**: View key statistics, including the total number of users, stores, and ratings.
*   **User Management**: View a filterable list of all users (by name, email, or role).
*   **Store Management**: View a filterable list of all registered stores (by name or address).
*   **Creation Capabilities**: Create new users (of any role) and new stores directly from the dashboard.

### 🔒 Security & Backend

*   **Password Hashing**: Passwords are securely hashed using **bcrypt.js**.
*   **JWT Authentication**: Protected routes are secured using JSON Web Tokens.
*   **Role-Based Access Control (RBAC)**: Middleware ensures users can only access routes permitted for their role.
*   **Input Validation**: Server-side validation of incoming data using **express-validator**.
*   **Security Headers**: **Helmet.js** is used to set various HTTP headers to protect against common vulnerabilities.
*   **Rate Limiting**: **express-rate-limit** is used to prevent brute-force attacks on authentication and other endpoints.
*   **Structured Logging**: **Winston** is used for detailed request and error logging, with outputs to both the console and log files (`logs/all.log`, `logs/error.log`).

## 🏗️ Architecture & Project Structure

The backend follows a layered architecture to separate concerns, making the code more modular and maintainable.

```
backend/src/
├── config/         # Database connection (db.js)
├── constants/      # Application-wide constants (roles, status codes)
├── controllers/    # Express route handlers, manage req/res cycle
├── middlewares/    # Custom middleware (auth, validation, error handling)
├── models/         # (Implicit) Schema is defined by database setup
├── routes/         # API route definitions
├── services/       # Business logic, interacts with the database
└── utils/          # Helper functions (JWT, logger, initial setup)
```

## 🚀 Tech Stack

### Backend

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MySQL
*   **Database Client**: `mysql2`
*   **Authentication**: `jsonwebtoken` (JWT)
*   **Password Hashing**: `bcryptjs`
*   **Security**: `helmet`, `cors`
*   **Rate Limiting**: `express-rate-limit`
*   **Validation**: `express-validator`
*   **Logging**: `winston`
*   **Environment Variables**: `dotenv`

### Frontend

*   **Library**: React.js
*   **Build Tool**: Vite
*   **Routing**: React Router
*   **API Communication**: Axios
*   **State Management**: React Context API
*   **Styling**: Custom CSS with modern features

## 📋 Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (comes with Node.js)
*   MySQL Server

## ⚙️ Installation & Setup

### 1. Database Setup

1.  Start your MySQL server.
2.  Create a new database.
    ```sql
    CREATE DATABASE store_rating_db;
    ```
3.  Use the new database.
    ```sql
    USE store_rating_db;
    ```
4.  Execute the following SQL commands to create the necessary tables.

    ```sql
    -- Create the users table
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        address TEXT,
        password VARCHAR(255) NOT NULL,
        role ENUM('USER', 'STORE_OWNER', 'ADMIN') NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the stores table
    CREATE TABLE stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        address TEXT NOT NULL,
        owner_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Create the ratings table
    CREATE TABLE ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store_rating (user_id, store_id)
    );
    ```

### 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd store-rating-app/backend
    ```
2.  Install the required npm packages:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` root directory. Copy the contents of `.env.example` (if present) or use the template below, replacing the placeholders with your database credentials.

    ```env
    # Database Configuration
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=store_rating_db

    # JWT Configuration
    JWT_SECRET=a_long_and_very_secret_key_for_your_jwt

    # Server Configuration
    PORT=5000

    # Frontend URL for CORS
    FRONTEND_URL=http://localhost:5173
    ```

4.  Start the backend server:
    ```bash
    npm start
    ```
    The server will run on `http://localhost:5000`.

    **Note:** On the first run, a default administrator account will be created automatically.
    *   **Email:** `admin@example.com`
    *   **Password:** `Password123!`

### 3. Frontend Setup

1.  Open a new terminal and navigate to the `frontend` directory:
    ```bash
    cd store-rating-app/frontend
    ```
2.  Install the required npm packages:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` root directory and add the following variable:
    ```env
    VITE_API_BASE_URL=http://localhost:5000
    ```
4.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## 📜 Available Scripts

### Backend (`store-rating-app/backend`)

*   `npm start`: Starts the backend server using `node`.
*   `npm test`: (Not yet implemented) Will run the test suite.

### Frontend (`store-rating-app/frontend`)

*   `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
*   `npm run build`: Bundles the React application for production.
*   `npm run lint`: Lints the source code using ESLint.
*   `npm run preview`: Serves the production build locally for previewing.

## 🔐 API Endpoints

<details>
<summary>Click to expand API endpoint summary</summary>

| Method | Endpoint                       | Protection    | Description                                          |
| :----- | :----------------------------- | :------------ | :--------------------------------------------------- |
| **Auth** |                                |               |                                                      |
| `POST` | `/api/auth/register`           | Public        | Registers a new user with the 'USER' role.           |
| `POST` | `/api/auth/register-owner`     | Public        | Registers a new store owner and their store.         |
| `POST` | `/api/auth/login`              | Public        | Authenticates a user and returns a JWT.              |
| **Users** |                              |               |                                                      |
| `PUT`  | `/api/users/update-password`   | User, Owner, Admin | Updates the logged-in user's password.             |
| `POST` | `/api/users`                   | Admin         | Creates a new user (any role).                       |
| `GET`  | `/api/users`                   | Admin         | Gets a list of all users with filtering.             |
| `GET`  | `/api/users/:id`               | Admin         | Gets details for a single user.                      |
| **Stores** |                             |               |                                                      |
| `GET`  | `/api/stores`                  | User, Owner, Admin | Gets a list of all stores with search.             |
| `POST` | `/api/stores`                  | Admin         | Creates a new store.                                 |
| `GET`  | `/api/stores/dashboard-stats`  | Admin         | Gets platform-wide statistics.                       |
| `GET`  | `/api/stores/my-store`         | Store Owner   | Gets dashboard data for the owner's store.         |
| `POST` | `/api/stores/:storeId/ratings` | User, Owner, Admin | Submits or updates a rating for a specific store.    |

</details>