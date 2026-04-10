import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
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

const buildTicketMessage = (draft: FeedbackDraftTemplate) =>
    `Тема: ${draft.topic}

Описание проблемы:
${draft.problem}

Ожидаемый результат:
${draft.expectedResult}

Контакты:
${draft.contacts}`;

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
            const now = new Date().toISOString();
            const ticketId = `t-${Date.now()}`;
            const messageId = `m-${Date.now()}`;

            const newTicket: FeedbackTicket = {
                id: ticketId,
                subject: draft.topic || 'Новое обращение',
                status: 'new',
                regionCode: action.payload.regionCode,
                regionName: action.payload.regionName,
                createdAt: now,
                updatedAt: now,
                createdByUserId: action.payload.userId,
                unreadForUser: 0,
                unreadForAdmin: 1,
                templateData: draft,
            };

            const firstMessage: FeedbackMessage = {
                id: messageId,
                ticketId,
                authorRole: 'user',
                authorName: action.payload.regionName,
                text: buildTicketMessage(draft),
                createdAt: now,
                isReadByUser: true,
                isReadByAdmin: false,
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
            };

            state.messages.push(message);
            state.replyText = '';

            state.tickets = state.tickets.map((ticket) =>
                ticket.id === action.payload.ticketId
                    ? {
                        ...ticket,
                        updatedAt: now,
                        unreadForUser:
                            action.payload.authorRole === 'admin'
                                ? ticket.unreadForUser + 1
                                : ticket.unreadForUser,
                        unreadForAdmin:
                            action.payload.authorRole === 'user'
                                ? ticket.unreadForAdmin + 1
                                : ticket.unreadForAdmin,
                    }
                    : ticket,
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

            state.messages = state.messages.map((message) =>
                message.ticketId === ticketId
                    ? {
                        ...message,
                        isReadByUser: viewerRole === 'user' ? true : message.isReadByUser,
                        isReadByAdmin: viewerRole === 'admin' ? true : message.isReadByAdmin,
                    }
                    : message,
            );

            state.tickets = state.tickets.map((ticket) =>
                ticket.id === ticketId
                    ? {
                        ...ticket,
                        unreadForUser: viewerRole === 'user' ? 0 : ticket.unreadForUser,
                        unreadForAdmin: viewerRole === 'admin' ? 0 : ticket.unreadForAdmin,
                    }
                    : ticket,
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

            state.tickets = state.tickets.map((ticket) =>
                ticket.id === action.payload.ticketId
                    ? {
                        ...ticket,
                        status: action.payload.status,
                        updatedAt: now,
                    }
                    : ticket,
            );
        },
    },
});

export const {
    setFeedbackStatusFilter,
    selectFeedbackTicket,
    openCreateFeedbackModal,
    closeCreateFeedbackModal,
    updateFeedbackDraft,
    setFeedbackReplyText,
    createFeedbackTicket,
    sendFeedbackReply,
    markFeedbackTicketRead,
    updateFeedbackTicketStatus,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;