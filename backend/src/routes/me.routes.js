import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get('/', (req, res) => {
    res.json({
        success: true,
        data: req.user,
    });
});