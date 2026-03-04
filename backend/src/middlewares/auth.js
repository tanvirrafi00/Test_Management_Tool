const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in cookie first (HttpOnly cookie)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Fallback to Authorization header for backward compatibility
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!req.user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is deactivated'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Check user roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Restrict Viewer role from modifying data (POST, PUT, DELETE)
const restrictViewer = (req, res, next) => {
    if (req.user.role === 'viewer' && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        return res.status(403).json({
            success: false,
            message: 'Viewer role has read-only access and cannot modify data'
        });
    }
    next();
};

module.exports = { protect, authorize, restrictViewer };
