import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
    FeedbackAttachment,
    FeedbackDraftTemplate,
    FeedbackMessage,
    FeedbackTicket,
    TicketStatus,
} from '../../types/feedback';
import {
    feedbackMessagesMock,
    feedbackTemplateInitial,
    feedbackTicketsMock,
} from './mockData';

type FeedbackState = {
    tickets: FeedbackTicket[];
    messages: FeedbackMessage[];
    selectedTicketId: string | null;
    statusFilter: 'all' | TicketStatus;
    isCreateModalOpen: boolean;
    draftTemplate: FeedbackDraftTemplate;
    replyText: string;
};

const initialState: FeedbackState = {
    tickets: feedbackTicketsMock,
    messages: feedbackMessagesMock,
    selectedTicketId: feedbackTicketsMock[0]?.id ?? null,
    statusFilter: 'all',
    isCreateModalOpen: false,
    draftTemplate: feedbackTemplateInitial,
    replyText: '',
};

const isFinalStatus = (status: TicketStatus) => status === 'resolved' || status === 'closed';

const buildSubject = (draft: FeedbackDraftTemplate) => {
    const firstLine = draft.text.trim().split('\n')[0] || 'Новое обращение';
    return firstLine.length > 80 ? `${firstLine.slice(0, 80)}...` : firstLine;
};

const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
        setFeedbackStatusFilter(state, action: PayloadAction<'all' | TicketStatus>) {
            state.statusFilter = action.payload;
        },

        selectFeedbackTicket(state, action: PayloadAction<string>) {
            state.selectedTicketId = action.payload;
        },

        openCreateFeedbackModal(state) {
            state.isCreateModalOpen = true;
        },

        closeCreateFeedbackModal(state) {
            state.isCreateModalOpen = false;
            state.draftTemplate = feedbackTemplateInitial;
        },

        updateFeedbackDraft(state, action: PayloadAction<Partial<FeedbackDraftTemplate>>) {
            state.draftTemplate = {
                ...state.draftTemplate,
                ...action.payload,
            };
        },

        setFeedbackDraftAttachment(state, action: PayloadAction<FeedbackAttachment | null>) {
            state.draftTemplate.attachment = action.payload;
        },

        setFeedbackReplyText(state, action: PayloadAction<string>) {
            state.replyText = action.payload;
        },

        createFeedbackTicket(
            state,
            action: PayloadAction<{
                userId: string;
                regionCode: string;
                regionName: string;
            }>,
        ) {
            const draft = state.draftTemplate;
            const text = draft.text.trim();
            if (!text) return;

            const now = new Date().toISOString();
            const ticketId = `t-${Date.now()}`;
            const messageId = `m-${Date.now()}`;

            const newTicket: FeedbackTicket = {
                id: ticketId,
                subject: buildSubject(draft),
                status: 'new',
                regionCode: action.payload.regionCode,
                regionName: action.payload.regionName,
                createdAt: now,
                updatedAt: now,
                createdByUserId: action.payload.userId,
                unreadForUser: 0,
                unreadForAdmin: 1,
            };

            const firstMessage: FeedbackMessage = {
                id: messageId,
                ticketId,
                authorRole: 'user',
                authorName: action.payload.regionName,
                text,
                createdAt: now,
                isReadByUser: true,
                isReadByAdmin: false,
                attachment: draft.attachment,
            };

            state.tickets.unshift(newTicket);
            state.messages.push(firstMessage);
            state.selectedTicketId = ticketId;
            state.isCreateModalOpen = false;
            state.draftTemplate = feedbackTemplateInitial;
        },

        sendFeedbackReply(
            state,
            action: PayloadAction<{
                ticketId: string;
                authorRole: 'user' | 'admin';
                authorName: string;
            }>,
        ) {
            const text = state.replyText.trim();
            if (!text) return;

            const ticket = state.tickets.find((item) => item.id === action.payload.ticketId);
            if (!ticket || isFinalStatus(ticket.status)) return;

            const now = new Date().toISOString();
            const message: FeedbackMessage = {
                id: `m-${Date.now()}`,
                ticketId: action.payload.ticketId,
                authorRole: action.payload.authorRole,
                authorName: action.payload.authorName,
                text,
                createdAt: now,
                isReadByUser: action.payload.authorRole === 'user',
                isReadByAdmin: action.payload.authorRole === 'admin',
                attachment: null,
            };

            state.messages.push(message);
            state.replyText = '';

            state.tickets = state.tickets.map((item) =>
                item.id === action.payload.ticketId
                    ? {
                        ...item,
                        updatedAt: now,
                        unreadForUser:
                            action.payload.authorRole === 'admin'
                                ? item.unreadForUser + 1
                                : item.unreadForUser,
                        unreadForAdmin:
                            action.payload.authorRole === 'user'
                                ? item.unreadForAdmin + 1
                                : item.unreadForAdmin,
                    }
                    : item,
            );
        },

        markFeedbackTicketRead(
            state,
            action: PayloadAction<{
                ticketId: string;
                viewerRole: 'user' | 'admin';
            }>,
        ) {
            const { ticketId, viewerRole } = action.payload;
            const ticket = state.tickets.find((item) => item.id === ticketId);
            if (!ticket) return;

            const alreadyRead =
                viewerRole === 'user'
                    ? ticket.unreadForUser === 0
                    : ticket.unreadForAdmin === 0;

            if (alreadyRead) return;

            state.messages = state.messages.map((message) => {
                if (message.ticketId !== ticketId) return message;

                if (viewerRole === 'user') {
                    return message.isReadByUser ? message : { ...message, isReadByUser: true };
                }

                return message.isReadByAdmin ? message : { ...message, isReadByAdmin: true };
            });

            state.tickets = state.tickets.map((item) =>
                item.id === ticketId
                    ? {
                        ...item,
                        unreadForUser: viewerRole === 'user' ? 0 : item.unreadForUser,
                        unreadForAdmin: viewerRole === 'admin' ? 0 : item.unreadForAdmin,
                    }
                    : item,
            );
        },

        updateFeedbackTicketStatus(
            state,
            action: PayloadAction<{
                ticketId: string;
                status: TicketStatus;
            }>,
        ) {
            const now = new Date().toISOString();

            state.tickets = state.tickets.map((ticket) => {
                if (ticket.id !== action.payload.ticketId) return ticket;

                if (isFinalStatus(ticket.status)) {
                    return ticket;
                }

                if (ticket.status === 'new' && action.payload.status === 'new') {
                    return ticket;
                }

                if (
                    ticket.status === 'new' &&
                    !['in_progress', 'resolved', 'closed'].includes(action.payload.status)
                ) {
                    return ticket;
                }

                if (
                    ticket.status === 'in_progress' &&
                    !['resolved', 'closed'].includes(action.payload.status)
                ) {
                    return ticket;
                }

                return {
                    ...ticket,
                    status: action.payload.status,
                    updatedAt: now,
                };
            });
        },
    },
});

export const {
    setFeedbackStatusFilter,
    selectFeedbackTicket,
    openCreateFeedbackModal,
    closeCreateFeedbackModal,
    updateFeedbackDraft,
    setFeedbackDraftAttachment,
    setFeedbackReplyText,
    createFeedbackTicket,
    sendFeedbackReply,
    markFeedbackTicketRead,
    updateFeedbackTicketStatus,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;