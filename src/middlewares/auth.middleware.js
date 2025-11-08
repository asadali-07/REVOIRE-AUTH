import jwt from 'jsonwebtoken';
import redis from '../db/redis.js';


export const authMiddleware = async (req, res, next) => {

    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    
    const isBlacklisted = await redis.get(`blacklisted_${token}`);
    
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Token is blacklisted' });
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
