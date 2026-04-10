import type { FeedbackDraftTemplate, FeedbackMessage, FeedbackStatusMeta, FeedbackTicket } from '../../types/feedback';

export const feedbackStatuses: FeedbackStatusMeta[] = [
    { key: 'new', label: 'Новый' },
    { key: 'in_progress', label: 'В работе' },
    { key: 'resolved', label: 'Решён' },
    { key: 'closed', label: 'Закрыт' },
];

export const feedbackTemplateInitial: FeedbackDraftTemplate = {
    topic: '',
    problem: '',
    expectedResult: '',
    contacts: '',
};

export const feedbackTicketsMock: FeedbackTicket[] = [
    {
        id: 't-1001',
        subject: 'Не отображается выгрузка по комиссии',
        status: 'new',
        regionCode: '77',
        regionName: '77 — Москва',
        createdAt: '2026-03-20T09:10:00',
        updatedAt: '2026-03-20T09:10:00',
        createdByUserId: 'user-77',
        unreadForUser: 0,
        unreadForAdmin: 1,
        templateData: {
            topic: 'Проблема с выгрузкой',
            problem: 'На странице Комиссии не скачивается статистика за выбранный квартал.',
            expectedResult: 'Ожидаю корректное скачивание xlsx файла.',
            contacts: 'ivanov@region.ru',
        },
    },
    {
        id: 't-1002',
        subject: 'Нужна консультация по статусам обращений',
        status: 'in_progress',
        regionCode: '77',
        regionName: '77 — Москва',
        createdAt: '2026-03-19T11:40:00',
        updatedAt: '2026-03-20T10:05:00',
        createdByUserId: 'user-77',
        unreadForUser: 1,
        unreadForAdmin: 0,
        templateData: {
            topic: 'Вопрос по логике сервиса',
            problem: 'Не до конца понятно, когда статус должен быть “решён”, а когда “закрыт”.',
            expectedResult: 'Ожидаю пояснение по использованию статусов.',
            contacts: 'ivanov@region.ru',
        },
    },
    {
        id: 't-1003',
        subject: 'Ошибка в карточке тикета',
        status: 'resolved',
        regionCode: '78',
        regionName: '78 — Санкт-Петербург',
        createdAt: '2026-03-18T14:20:00',
        updatedAt: '2026-03-20T08:50:00',
        createdByUserId: 'user-78',
        unreadForUser: 0,
        unreadForAdmin: 0,
        templateData: {
            topic: 'Ошибка интерфейса',
            problem: 'В карточке обращения съезжает кнопка отправки ответа.',
            expectedResult: 'Ожидаю исправление отображения.',
            contacts: 'support-spb@region.ru',
        },
    },
];

export const feedbackMessagesMock: FeedbackMessage[] = [
    {
        id: 'm-1',
        ticketId: 't-1001',
        authorRole: 'user',
        authorName: '77 — Москва',
        text:
            'Тема: Проблема с выгрузкой\n\nОписание проблемы:\nНа странице Комиссии не скачивается статистика за выбранный квартал.\n\nОжидаемый результат:\nОжидаю корректное скачивание xlsx файла.\n\nКонтакты:\nivanov@region.ru',
        createdAt: '2026-03-20T09:10:00',
        isReadByUser: true,
        isReadByAdmin: false,
    },
    {
        id: 'm-2',
        ticketId: 't-1002',
        authorRole: 'user',
        authorName: '77 — Москва',
        text:
            'Тема: Вопрос по логике сервиса\n\nОписание проблемы:\nНе до конца понятно, когда статус должен быть “решён”, а когда “закрыт”.\n\nОжидаемый результат:\nОжидаю пояснение по использованию статусов.\n\nКонтакты:\nivanov@region.ru',
        createdAt: '2026-03-19T11:40:00',
        isReadByUser: true,
        isReadByAdmin: true,
    },
    {
        id: 'm-3',
        ticketId: 't-1002',
        authorRole: 'admin',
        authorName: 'Поддержка',
        text:
            'Добрый день. Статус “решён” ставится, когда проблема устранена или вопрос закрыт по сути. “Закрыт” — когда обращение завершено окончательно и дальнейшая переписка не требуется.',
        createdAt: '2026-03-20T10:05:00',
        isReadByUser: false,
        isReadByAdmin: true,
    },
    {
        id: 'm-4',
        ticketId: 't-1003',
        authorRole: 'user',
        authorName: '78 — Санкт-Петербург',
        text:
            'Тема: Ошибка интерфейса\n\nОписание проблемы:\nВ карточке обращения съезжает кнопка отправки ответа.\n\nОжидаемый результат:\nОжидаю исправление отображения.\n\nКонтакты:\nsupport-spb@region.ru',
        createdAt: '2026-03-18T14:20:00',
        isReadByUser: true,
        isReadByAdmin: true,
    },
    {
        id: 'm-5',
        ticketId: 't-1003',
        authorRole: 'admin',
        authorName: 'Поддержка',
        text: 'Исправили отображение. Проверьте, пожалуйста.',
        createdAt: '2026-03-19T09:30:00',
        isReadByUser: true,
        isReadByAdmin: true,
    },
];