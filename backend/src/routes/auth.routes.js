import { Router } from 'express';
import { loginUser, getServiceModeState } from '../services/auth.service.js';
import { clearAuthCookie, setAuthCookie } from '../utils/cookies.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
    try {
        const { username, password, adminOnly = false } = req.body;

        const result = await loginUser({ username, password, adminOnly });

        if (!result.success) {
            return res.status(result.status).json(result);
        }

        setAuthCookie(res, result.token);

        return res.json({
            success: true,
            token: result.token,
            user: result.user,
            serviceMode: result.serviceMode,
        });
    } catch (error) {
        next(error);
    }
});

authRouter.post('/logout', (_req, res) => {
    clearAuthCookie(res);

    return res.json({
        success: true,
    });
});

authRouter.get('/service-mode', async (_req, res, next) => {
    try {
        const mode = await getServiceModeState();

        return res.json({
            success: true,
            data: mode,
        });
    } catch (error) {
        next(error);
    }
});

authRouter.get('/session', requireAuth, async (req, res) => {
    res.json({
        success: true,
        user: req.user,
    });
});