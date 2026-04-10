export type TicketStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export type FeedbackMessageAuthorRole = 'user' | 'admin';

export type FeedbackMessage = {
    id: string;
    ticketId: string;
    authorRole: FeedbackMessageAuthorRole;
    authorName: string;
    text: string;
    createdAt: string;
    isReadByUser: boolean;
    isReadByAdmin: boolean;
};

export type FeedbackTicket = {
    id: string;
    subject: string;
    status: TicketStatus;
    regionCode: string;
    regionName: string;
    createdAt: string;
    updatedAt: string;
    createdByUserId: string;
    unreadForUser: number;
    unreadForAdmin: number;
    templateData: {
        topic: string;
        problem: string;
        expectedResult: string;
        contacts: string;
    };
};

export type FeedbackStatusMeta = {
    key: TicketStatus;
    label: string;
};

export type FeedbackDraftTemplate = {
    topic: string;
    problem: string;
    expectedResult: string;
    contacts: string;
};