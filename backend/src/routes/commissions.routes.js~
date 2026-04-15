import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
    getCommissionsMeta,
    getCommissionsPage,
    getCommissionsSummary,
} from '../services/commissions.service.js';

export const commissionsRouter = Router();

commissionsRouter.use(requireAuth);

commissionsRouter.get('/meta', async (req, res, next) => {
    try {
        const data = await getCommissionsMeta({
            isAdmin: Boolean(req.user?.isAdmin),
            userRegion: req.user?.region || '',
        });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

commissionsRouter.get('/summary', async (req, res, next) => {
    try {
        const { region = '', quarter = '' } = req.query;

        const data = await getCommissionsSummary({
            region: String(region),
            quarter: String(quarter),
            isAdmin: Boolean(req.user?.isAdmin),
            userRegion: req.user?.region || '',
        });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

commissionsRouter.get('/', async (req, res, next) => {
    try {
        const {
            region = '',
            quarter = '',
            search = '',
            status = '',
            cursor = '',
            limit = '50',
        } = req.query;

        const data = await getCommissionsPage({
            region: String(region),
            quarter: String(quarter),
            search: String(search).trim(),
            status: String(status).trim(),
            isAdmin: Boolean(req.user?.isAdmin),
            userRegion: req.user?.region || '',
            cursor: String(cursor || ''),
            limit: Math.min(Number(limit || 50), 100),
        });

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});