import { pool } from '../db/pool.js';

function mapStatus(status) {
    if (status === 'new') return 'new';
    if (status === 'progress') return 'in_progress';
    if (status === 'resolved') return 'resolved';
    if (status === 'closed') return 'closed';
    return 'new';
}

function unmapStatus(status) {
    if (status === 'in_progress') return 'progress';
    if (status === 'resolved') return 'resolved';
    if (status === 'closed') return 'closed';
    return 'new';
}

export async function getTickets(currentUser) {
    const isAdmin = currentUser.isAdmin;

    const [rows] = await pool.query(
        `
      SELECT
        t.id,
        t.user,
        t.text,
        t.region,
        t.date,
        t.status,
        t.adminread,
        t.userread,
        u.surname,
        u.name,
        u.patronymic
      FROM tickets t
      LEFT JOIN users u ON u.id = t.user
      ${isAdmin ? '' : 'WHERE t.user = ?'}
      ORDER BY t.id DESC
    `,
        isAdmin ? [] : [currentUser.id]
    );

    return rows.map((row) => ({
        id: String(row.id),
        subject: (row.text || 'Обращение').split('\n')[0].slice(0, 80),
        status: mapStatus(row.status),
        regionCode: row.region || '',
        regionName: row.region || '',
        createdAt: row.date,
        updatedAt: row.date,
        createdByUserId: String(row.user),
        unreadForUser: Number(row.userread) === 1 ? 0 : 1,
        unreadForAdmin: Number(row.adminread) === 1 ? 0 : 1,
        authorFullName: `${row.surname || ''} ${row.name || ''} ${row.patronymic || ''}`.trim(),
    }));
}

export async function getMessages(ticketId) {
    const [rows] = await pool.query(
        `
      SELECT
        id,
        ticket,
        text,
        sender,
        receiver,
        senderisadmin,
        receiverisadmin,
        date
      FROM tickets_messages
      WHERE ticket = ?
      ORDER BY id ASC
    `,
        [ticketId]
    );

    return rows.map((row) => ({
        id: String(row.id),
        ticketId: String(row.ticket),
        authorRole: Number(row.senderisadmin) === 1 ? 'admin' : 'user',
        authorName: Number(row.senderisadmin) === 1 ? 'Поддержка' : 'Пользователь',
        text: row.text || '',
        createdAt: row.date,
        isReadByUser: Number(row.receiverisadmin) === 1 ? false : true,
        isReadByAdmin: Number(row.receiverisadmin) === 1 ? true : false,
        attachment: null,
    }));
}

export async function createTicket({ currentUser, text }) {
    const [result] = await pool.query(
        `
      INSERT INTO tickets (
        user,
        text,
        region,
        date,
        status,
        adminread,
        userread
      )
      VALUES (?, ?, ?, NOW(), 'new', 0, 1)
    `,
        [currentUser.id, text, currentUser.region || '']
    );

    return String(result.insertId);
}

export async function createTicketMessage({ ticketId, currentUser, text }) {
    const isAdmin = currentUser.isAdmin ? 1 : 0;

    await pool.query(
        `
      INSERT INTO tickets_messages (
        ticket,
        text,
        sender,
        receiver,
        senderisadmin,
        receiverisadmin,
        date
      )
      VALUES (?, ?, ?, NULL, ?, ?, NOW())
    `,
        [ticketId, text, currentUser.id, isAdmin, isAdmin === 1 ? 0 : 1]
    );

    await pool.query(
        `
      UPDATE tickets
      SET
        adminread = ?,
        userread = ?
      WHERE id = ?
    `,
        [isAdmin === 1 ? 1 : 0, isAdmin === 1 ? 0 : 1, ticketId]
    );
}

export async function updateTicketStatus({ ticketId, status }) {
    await pool.query(
        `
      UPDATE tickets
      SET status = ?
      WHERE id = ?
    `,
        [unmapStatus(status), ticketId]
    );
}