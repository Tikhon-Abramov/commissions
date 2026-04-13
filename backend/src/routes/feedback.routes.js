import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
    createTicket,
    createTicketMessage,
    getMessages,
    getTickets,
    updateTicketStatus,
} from '../services/feedback.service.js';

export const feedbackRouter = Router();

feedbackRouter.use(requireAuth);

feedbackRouter.get('/tickets', async (req, res, next) => {
    try {
        const data = await getTickets(req.user);

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});

feedbackRouter.get('/tickets/:ticketId/messages', async (req, res, next) => {
    try {
        const data = await getMessages(req.params.ticketId);

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});

feedbackRouter.post('/tickets', async (req, res, next) => {
    try {
        const { text } = req.body;
        const ticketId = await createTicket({
            currentUser: req.user,
            text,
        });

        res.json({
            success: true,
            ticketId,
        });
    } catch (error) {
        next(error);
    }
});

feedbackRouter.post('/tickets/:ticketId/messages', async (req, res, next) => {
    try {
        const { text } = req.body;

        await createTicketMessage({
            ticketId: req.params.ticketId,
            currentUser: req.user,
            text,
        });

        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
});

feedbackRouter.patch('/tickets/:ticketId/status', async (req, res, next) => {
    try {
        const { status } = req.body;

        await updateTicketStatus({
            ticketId: req.params.ticketId,
            status,
        });

        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
});