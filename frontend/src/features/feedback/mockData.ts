import type { FeedbackDraftTemplate, FeedbackStatusMeta } from '../../types/feedback';

export const feedbackStatuses: FeedbackStatusMeta[] = [
    { key: 'new', label: 'Новый' },
    { key: 'in_progress', label: 'В работе' },
    { key: 'resolved', label: 'Решён' },
    { key: 'closed', label: 'Закрыт' },
];

export const feedbackTemplateInitial: FeedbackDraftTemplate = {
    text: '',
    attachment: null,
};