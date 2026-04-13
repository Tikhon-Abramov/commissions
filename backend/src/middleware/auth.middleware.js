import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;

        const tokenFromCookie = req.cookies?.[process.env.COOKIE_NAME || 'commissions_token'];
        const token = tokenFromHeader || tokenFromCookie;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        req.user = verifyToken(token);
        next();
    } catch (_error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
}

export function requireAdmin(req, res, next) {
    if (!req.user?.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden',
        });
    }

    next();
}