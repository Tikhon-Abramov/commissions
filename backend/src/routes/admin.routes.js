import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';
import {
    createUser,
    getServiceMode,
    getUsers,
    toggleUserActive,
    updateServiceMode,
    updateUser,
} from '../services/admin.service.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/users', async (_req, res, next) => {
    try {
        const users = await getUsers();

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.post('/users', async (req, res, next) => {
    try {
        await createUser(req.body);

        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/users/:id', async (req, res, next) => {
    try {
        await updateUser(req.params.id, req.body);

        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.patch('/users/:id/toggle-active', async (req, res, next) => {
    try {
        await toggleUserActive(req.params.id);

        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.get('/service-mode', async (_req, res, next) => {
    try {
        const data = await getServiceMode();

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.put('/service-mode', async (req, res, next) => {
    try {
        const { enabled, message } = req.body;

        await updateServiceMode({ enabled, message });

        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
});