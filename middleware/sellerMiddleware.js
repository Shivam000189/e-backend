const sellerMiddleware = (req, res, next) => {
    if (!req.user || !['seller', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Seller only' });
    }

    next();
};

module.exports = sellerMiddleware;
