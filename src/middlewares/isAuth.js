const jwt = require('jsonwebtoken');
const { errorResMsg } = require('../utils/lib/response.js');
const logger = require('../utils/log/logger.js');

const isAuthenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if token exists and starts with "Bearer"
        if (!authHeader ) {
            return errorResMsg(res, 401, "Authentication failed: Authourization header missing");
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return errorResMsg(res, 401, "Authentication failed: Token missing")
        }
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return errorResMsg(res, 401, 'Authentication failed: Token verification failed');
        }

        // Attach user info to request
        req.user = decoded;

        next(); // Allow the request to proceed
    } catch (error) {
        logger.error("Auth error:", error);
        return errorResMsg(res, 401, "Invalid or expired token");
    }
};

module.exports = isAuthenticated;
