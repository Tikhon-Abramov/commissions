import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { PageHeader } from '../components/common/PageHeader';
import {
    closeCreateFeedbackModal,
    createFeedbackTicket,
    markFeedbackTicketRead,
    openCreateFeedbackModal,
    selectFeedbackTicket,
    sendFeedbackReply,
    setFeedbackReplyText,
    setFeedbackStatusFilter,
    updateFeedbackDraft,
    updateFeedbackTicketStatus,
} from '../features/feedback/feedbackSlice';
import { feedbackStatuses } from '../features/feedback/mockData';
import type { TicketStatus } from '../types/feedback';

const statusLabels: Record<TicketStatus, string> = {
    new: 'Новый',
    in_progress: 'В работе',
    resolved: 'Решён',
    closed: 'Закрыт',
};

const PageWrap = styled.div`
  display: grid;
  gap: 16px;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const StatChip = styled.div`
  padding: 10px 14px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 13px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const PrimaryButton = styled.button`
  height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 600;
  cursor: pointer;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

const TicketList = styled.div`
  display: grid;
`;

const TicketItem = styled.button<{ $active?: boolean }>`
  padding: 14px 16px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $active }) => ($active ? theme.colors.surfaceAlt : theme.colors.surface)};
  text-align: left;
  cursor: pointer;
`;

const TicketTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
`;

const TicketSubject = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const TicketMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 6px;
`;

const StatusBadge = styled.span<{ $status: TicketStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $status }) => {
    if ($status === 'new') return 'rgba(59, 130, 246, 0.12)';
    if ($status === 'in_progress') return 'rgba(245, 158, 11, 0.14)';
    if ($status === 'resolved') return 'rgba(34, 197, 94, 0.14)';
    return 'rgba(107, 114, 128, 0.14)';
}};
  color: ${({ $status }) => {
    if ($status === 'new') return '#2563eb';
    if ($status === 'in_progress') return '#d97706';
    if ($status === 'resolved') return '#16a34a';
    return '#6b7280';
}};
`;

const UnreadDot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
`;

const EmptyBox = styled.div`
  padding: 28px 20px;
  color: ${({ theme }) => theme.colors.muted};
`;

const ChatCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.surface};
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 620px;
`;

const ChatHeader = styled.div`
  padding: 16px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const ChatTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const ChatSubtitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 4px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Messages = styled.div`
  padding: 18px;
  display: grid;
  gap: 12px;
  align-content: start;
  max-height: 100%;
  overflow-y: auto;
`;

const MessageBubble = styled.div<{ $mine?: boolean }>`
  max-width: 78%;
  padding: 12px 14px;
  border-radius: 16px;
  background: ${({ theme, $mine }) => ($mine ? theme.colors.primarySoft : theme.colors.surfaceAlt)};
  justify-self: ${({ $mine }) => ($mine ? 'end' : 'start')};
  white-space: pre-wrap;
`;

const MessageAuthor = styled.div`
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 6px;
`;

const MessageTime = styled.div`
  margin-top: 8px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.muted};
`;

const ReplyBox = styled.div`
  padding: 16px 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  gap: 10px;
`;

const Textarea = styled.textarea`
  min-height: 92px;
  resize: vertical;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 14px;
`;

const ReplyActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const SecondaryButton = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;

const Modal = styled.div`
  width: min(720px, calc(100vw - 32px));
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 18px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 18px;
  font-weight: 700;
`;

const ModalBody = styled.div`
  padding: 18px 20px;
  display: grid;
  gap: 14px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: 13px;
`;

const Input = styled.input`
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const ModalFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const regionNameFromCode = (code?: string | null) => {
    if (code === '77') return '77 — Москва';
    if (code === '78') return '78 — Санкт-Петербург';
    if (code === '50') return '50 — Московская область';
    return 'Регион пользователя';
};

export function FeedbackPage() {
    const dispatch = useAppDispatch();
    const { isAdmin, region } = useAppSelector((state) => state.auth);
    const {
        tickets,
        messages,
        selectedTicketId,
        statusFilter,
        isCreateModalOpen,
        draftTemplate,
        replyText,
    } = useAppSelector((state) => state.feedback);

    const currentUserId = isAdmin ? 'admin-1' : `user-${region ?? '77'}`;
    const currentRegionName = regionNameFromCode(region);

    const visibleTickets = useMemo(() => {
        const base = isAdmin
            ? tickets
            : tickets.filter((ticket) => ticket.createdByUserId === currentUserId);

        const filtered =
            statusFilter === 'all'
                ? base
                : base.filter((ticket) => ticket.status === statusFilter);

        return [...filtered].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
    }, [currentUserId, isAdmin, statusFilter, tickets]);

    const selectedTicket =
        visibleTickets.find((ticket) => ticket.id === selectedTicketId) ??
        tickets.find((ticket) => ticket.id === selectedTicketId) ??
        null;

    const selectedMessages = useMemo(() => {
        if (!selectedTicket) return [];
        return messages
            .filter((message) => message.ticketId === selectedTicket.id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages, selectedTicket]);

    const stats = useMemo(() => {
        const base = isAdmin
            ? tickets
            : tickets.filter((ticket) => ticket.createdByUserId === currentUserId);

        return {
            total: base.length,
            new: base.filter((ticket) => ticket.status === 'new').length,
            in_progress: base.filter((ticket) => ticket.status === 'in_progress').length,
            resolved: base.filter((ticket) => ticket.status === 'resolved').length,
            closed: base.filter((ticket) => ticket.status === 'closed').length,
        };
    }, [currentUserId, isAdmin, tickets]);

    useEffect(() => {
        if (!selectedTicketId && visibleTickets.length) {
            dispatch(selectFeedbackTicket(visibleTickets[0].id));
        }
    }, [dispatch, selectedTicketId, visibleTickets]);

    useEffect(() => {
        if (!selectedTicket) return;
        dispatch(
            markFeedbackTicketRead({
                ticketId: selectedTicket.id,
                viewerRole: isAdmin ? 'admin' : 'user',
            }),
        );
    }, [dispatch, isAdmin, selectedTicket]);

    const unreadCount = useMemo(() => {
        const base = isAdmin
            ? tickets
            : tickets.filter((ticket) => ticket.createdByUserId === currentUserId);

        return base.reduce(
            (acc, ticket) => acc + (isAdmin ? ticket.unreadForAdmin : ticket.unreadForUser),
            0,
        );
    }, [currentUserId, isAdmin, tickets]);

    const handleSendReply = () => {
        if (!selectedTicket) return;

        dispatch(
            sendFeedbackReply({
                ticketId: selectedTicket.id,
                authorRole: isAdmin ? 'admin' : 'user',
                authorName: isAdmin ? 'Поддержка' : currentRegionName,
            }),
        );
    };

    return (
        <PageWrap>
            <PageHeader
                title="Обратная связь"
                description={`Обращения и переписка с поддержкой.${unreadCount ? ` Непрочитано: ${unreadCount}.` : ''}`}
            />

            <Toolbar>
                <StatsRow>
                    <StatChip>Всего: {stats.total}</StatChip>
                    <StatChip>Новых: {stats.new}</StatChip>
                    <StatChip>В работе: {stats.in_progress}</StatChip>
                    <StatChip>Решённых: {stats.resolved}</StatChip>
                    <StatChip>Закрытых: {stats.closed}</StatChip>
                </StatsRow>

                <Controls>
                    <Select
                        value={statusFilter}
                        onChange={(e) =>
                            dispatch(setFeedbackStatusFilter(e.target.value as 'all' | TicketStatus))
                        }
                    >
                        <option value="all">Все статусы</option>
                        {feedbackStatuses.map((status) => (
                            <option key={status.key} value={status.key}>
                                {status.label}
                            </option>
                        ))}
                    </Select>

                    {!isAdmin ? (
                        <PrimaryButton type="button" onClick={() => dispatch(openCreateFeedbackModal())}>
                            Новое обращение
                        </PrimaryButton>
                    ) : null}
                </Controls>
            </Toolbar>

            <Layout>
                <Sidebar>
                    {!visibleTickets.length ? (
                        <EmptyBox>Обращения не найдены.</EmptyBox>
                    ) : (
                        <TicketList>
                            {visibleTickets.map((ticket) => {
                                const unread = isAdmin ? ticket.unreadForAdmin : ticket.unreadForUser;

                                return (
                                    <TicketItem
                                        key={ticket.id}
                                        $active={ticket.id === selectedTicket?.id}
                                        onClick={() => dispatch(selectFeedbackTicket(ticket.id))}
                                    >
                                        <TicketTop>
                                            <TicketSubject>{ticket.subject}</TicketSubject>
                                            <StatusBadge $status={ticket.status}>
                                                {statusLabels[ticket.status]}
                                            </StatusBadge>
                                        </TicketTop>

                                        <TicketMeta>
                                            {ticket.regionName}
                                            <br />
                                            {formatDateTime(ticket.updatedAt)}
                                        </TicketMeta>

                                        {unread > 0 ? <div style={{ marginTop: 8 }}><UnreadDot>{unread}</UnreadDot></div> : null}
                                    </TicketItem>
                                );
                            })}
                        </TicketList>
                    )}
                </Sidebar>

                <ChatCard>
                    {!selectedTicket ? (
                        <EmptyBox>Выберите обращение слева или создайте новое.</EmptyBox>
                    ) : (
                        <>
                            <ChatHeader>
                                <div>
                                    <ChatTitle>{selectedTicket.subject}</ChatTitle>
                                    <ChatSubtitle>
                                        {selectedTicket.regionName} · {statusLabels[selectedTicket.status]}
                                    </ChatSubtitle>
                                </div>

                                <HeaderActions>
                                    {isAdmin ? (
                                        <>
                                            <SecondaryButton
                                                type="button"
                                                onClick={() =>
                                                    dispatch(
                                                        updateFeedbackTicketStatus({
                                                            ticketId: selectedTicket.id,
                                                            status: 'in_progress',
                                                        }),
                                                    )
                                                }
                                            >
                                                В работу
                                            </SecondaryButton>
                                            <SecondaryButton
                                                type="button"
                                                onClick={() =>
                                                    dispatch(
                                                        updateFeedbackTicketStatus({
                                                            ticketId: selectedTicket.id,
                                                            status: 'resolved',
                                                        }),
                                                    )
                                                }
                                            >
                                                Решён
                                            </SecondaryButton>
                                            <SecondaryButton
                                                type="button"
                                                onClick={() =>
                                                    dispatch(
                                                        updateFeedbackTicketStatus({
                                                            ticketId: selectedTicket.id,
                                                            status: 'closed',
                                                        }),
                                                    )
                                                }
                                            >
                                                Закрыт
                                            </SecondaryButton>
                                        </>
                                    ) : (
                                        <>
                                            <SecondaryButton
                                                type="button"
                                                onClick={() =>
                                                    dispatch(
                                                        updateFeedbackTicketStatus({
                                                            ticketId: selectedTicket.id,
                                                            status: 'resolved',
                                                        }),
                                                    )
                                                }
                                            >
                                                Отметить решённым
                                            </SecondaryButton>
                                            <SecondaryButton
                                                type="button"
                                                onClick={() =>
                                                    dispatch(
                                                        updateFeedbackTicketStatus({
                                                            ticketId: selectedTicket.id,
                                                            status: 'closed',
                                                        }),
                                                    )
                                                }
                                            >
                                                Закрыть
                                            </SecondaryButton>
                                        </>
                                    )}
                                </HeaderActions>
                            </ChatHeader>

                            <Messages>
                                {selectedMessages.map((message) => {
                                    const mine =
                                        (isAdmin && message.authorRole === 'admin') ||
                                        (!isAdmin && message.authorRole === 'user');

                                    return (
                                        <MessageBubble key={message.id} $mine={mine}>
                                            <MessageAuthor>{message.authorName}</MessageAuthor>
                                            <div>{message.text}</div>
                                            <MessageTime>{formatDateTime(message.createdAt)}</MessageTime>
                                        </MessageBubble>
                                    );
                                })}
                            </Messages>

                            <ReplyBox>
                                <Textarea
                                    value={replyText}
                                    onChange={(e) => dispatch(setFeedbackReplyText(e.target.value))}
                                    placeholder="Введите сообщение..."
                                />

                                <ReplyActions>
                                    <div />
                                    <PrimaryButton type="button" onClick={handleSendReply}>
                                        Отправить
                                    </PrimaryButton>
                                </ReplyActions>
                            </ReplyBox>
                        </>
                    )}
                </ChatCard>
            </Layout>

            {isCreateModalOpen ? (
                <Overlay onClick={() => dispatch(closeCreateFeedbackModal())}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>Новое обращение</ModalHeader>

                        <ModalBody>
                            <Field>
                                Тема обращения
                                <Input
                                    value={draftTemplate.topic}
                                    onChange={(e) => dispatch(updateFeedbackDraft({ topic: e.target.value }))}
                                />
                            </Field>

                            <Field>
                                Описание проблемы
                                <Textarea
                                    value={draftTemplate.problem}
                                    onChange={(e) => dispatch(updateFeedbackDraft({ problem: e.target.value }))}
                                />
                            </Field>

                            <Field>
                                Ожидаемый результат
                                <Textarea
                                    value={draftTemplate.expectedResult}
                                    onChange={(e) => dispatch(updateFeedbackDraft({ expectedResult: e.target.value }))}
                                />
                            </Field>

                            <Field>
                                Контакты для обратной связи
                                <Input
                                    value={draftTemplate.contacts}
                                    onChange={(e) => dispatch(updateFeedbackDraft({ contacts: e.target.value }))}
                                />
                            </Field>
                        </ModalBody>

                        <ModalFooter>
                            <SecondaryButton type="button" onClick={() => dispatch(closeCreateFeedbackModal())}>
                                Отмена
                            </SecondaryButton>
                            <PrimaryButton
                                type="button"
                                onClick={() =>
                                    dispatch(
                                        createFeedbackTicket({
                                            userId: currentUserId,
                                            regionCode: region ?? '77',
                                            regionName: currentRegionName,
                                        }),
                                    )
                                }
                            >
                                Отправить обращение
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                </Overlay>
            ) : null}
        </PageWrap>
    );
}