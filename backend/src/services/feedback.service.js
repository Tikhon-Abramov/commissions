import { pool } from '../db/pool.js';

function mapStatus(status) {
    if (status === 'new') return 'new';
    if (status === 'progress') return 'in_progress';
    if (status === 'solved') return 'resolved';
    if (status === 'closed') return 'closed';
    return 'new';
}

function unmapStatus(status) {
    if (status === 'in_progress') return 'progress';
    if (status === 'resolved') return 'solved';
    if (status === 'closed') return 'closed';
    return 'new';
}

export async function getTickets(currentUser) {
    const isAdmin = currentUser.isAdmin;

    const [rows] = await pool.query(
        `
      SELECT
        t.id,
        t.created_at,
        t.updated_at,
        t.status,
        t.user_id,
        t.closed_by,
        t.is_read,
        u.region,
        u.surname,
        u.name,
        u.patronymic,
        (
          SELECT tm.content
          FROM tickets_messages tm
          WHERE tm.ticket_id = t.id
          ORDER BY tm.created_at ASC
          LIMIT 1
        ) AS first_message
      FROM tickets t
      LEFT JOIN users u ON u.id = t.user_id
      ${isAdmin ? '' : 'WHERE t.user_id = ?'}
      ORDER BY t.id DESC
    `,
        isAdmin ? [] : [currentUser.id]
    );

    return rows.map((row) => ({
        id: String(row.id),
        subject: (row.first_message || 'Обращение').split('\n')[0].slice(0, 80),
        status: mapStatus(row.status),
        regionCode: row.region || '',
        regionName: row.region || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at,
        createdByUserId: String(row.user_id),
        unreadForUser: Number(row.is_read) === 1 ? 0 : 1,
        unreadForAdmin: Number(row.is_read) === 1 ? 0 : 1,
        authorFullName: `${row.surname || ''} ${row.name || ''} ${row.patronymic || ''}`.trim(),
    }));
}

export async function getMessages(ticketId) {
    const [rows] = await pool.query(
        `
      SELECT
        tm.id,
        tm.ticket_id,
        tm.user_id,
        tm.content,
        tm.created_at,
        u.isAdmin,
        u.region,
        u.surname,
        u.name,
        u.patronymic
      FROM tickets_messages tm
      LEFT JOIN users u ON u.id = tm.user_id
      WHERE tm.ticket_id = ?
      ORDER BY tm.created_at ASC, tm.id ASC
    `,
        [ticketId]
    );

    return rows.map((row) => {
        const isAdmin = Number(row.isAdmin) === 1;

        return {
            id: String(row.id),
            ticketId: String(row.ticket_id),
            authorRole: isAdmin ? 'admin' : 'user',
            authorName: isAdmin
                ? 'Поддержка'
                : `${row.region || ''}`.trim() ||
                `${row.surname || ''} ${row.name || ''}`.trim() ||
                'Пользователь',
            text: row.content || '',
            createdAt: row.created_at,
            isReadByUser: true,
            isReadByAdmin: true,
            attachment: null,
        };
    });
}

export async function createTicket({ currentUser, text }) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [ticketResult] = await connection.query(
            `
        INSERT INTO tickets (
          created_at,
          updated_at,
          status,
          category,
          user_id,
          closed_by,
          is_read,
          period
        )
        VALUES (NOW(), NOW(), 'new', 0, ?, NULL, 0, NULL)
      `,
            [currentUser.id]
        );

        const ticketId = ticketResult.insertId;

        await connection.query(
            `
        INSERT INTO tickets_messages (
          created_at,
          ticket_id,
          user_id,
          content,
          period
        )
        VALUES (NOW(), ?, ?, ?, NULL)
      `,
            [ticketId, currentUser.id, text]
        );

        await connection.commit();

        return String(ticketId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function createTicketMessage({ ticketId, currentUser, text }) {
    await pool.query(
        `
      INSERT INTO tickets_messages (
        created_at,
        ticket_id,
        user_id,
        content,
        period
      )
      VALUES (NOW(), ?, ?, ?, NULL)
    `,
        [ticketId, currentUser.id, text]
    );

    await pool.query(
        `
      UPDATE tickets
      SET
        updated_at = NOW(),
        is_read = 0
      WHERE id = ?
    `,
        [ticketId]
    );
}

export async function updateTicketStatus({ ticketId, status, currentUser }) {
    await pool.query(
        `
            UPDATE tickets
            SET
                status = ?,
                updated_at = NOW(),
                closed_by = ?
            WHERE id = ?
        `,
        [
            unmapStatus(status),
            status === 'closed' || status === 'resolved' ? currentUser.id : null,
            ticketId,
        ]
    );
}