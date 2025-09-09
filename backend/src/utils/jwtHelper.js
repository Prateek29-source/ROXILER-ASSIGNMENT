const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
    const payload = {
        user: {
            id: userId,
            role: role
        }
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });
};

module.exports = { generateToken };
