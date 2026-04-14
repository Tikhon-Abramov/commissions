import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
    getCommissionsList,
    getCommissionsMeta,
} from '../services/commissions.service.js';

export const commissionsRouter = Router();

commissionsRouter.use(requireAuth);

commissionsRouter.get('/meta', async (req, res, next) => {
    try {
        const data = await getCommissionsMeta({
            isAdmin: Boolean(req.user?.isAdmin),
            userRegion: req.user?.region || '',
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});

commissionsRouter.get('/', async (req, res, next) => {
    try {
        const { region = '', quarter = '', status = '', search = '' } = req.query;

        const data = await getCommissionsList({
            region: String(region),
            quarter: String(quarter),
            status: String(status),
            search: String(search),
            isAdmin: Boolean(req.user?.isAdmin),
            userRegion: req.user?.region || '',
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});