import { pool } from '../db/pool.js';

const META_TTL_MS = 60 * 60 * 1000;
const SUMMARY_TTL_MS = 60 * 1000;
const DATES_TTL_MS = 10 * 60 * 1000;

const cache = new Map();

function getCache(key) {
    const cached = cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
        cache.delete(key);
        return null;
    }
    return cached.value;
}

function setCache(key, value, ttlMs) {
    cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
    });
}

function toIsoDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
}

function normalizeInn(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

function formatQuarterLabel(quartal, year) {
    return `${quartal} квартал ${year}`;
}

function mapCommissionStatus(value) {
    const status = String(value || '').trim().toLowerCase();

    if (!status) return '';

    if (
        status.includes('провед') ||
        status.includes('состоял') ||
        status.includes('состоялась')
    ) {
        return 'Комиссия проведена';
    }

    if (status.includes('неяв')) {
        return 'Неявка на комиссию';
    }

    if (status.includes('не требует') || status.includes('не требуется')) {
        return 'Не требуется проведение комиссии';
    }

    return String(value || '');
}

function mapInteractionStatus(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

function normalizeProtocolName(value) {
    if (!value) return '';
    return String(value).trim();
}

function decodeCursor(cursor) {
    if (!cursor) return null;

    try {
        return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
}

function encodeCursor(payload) {
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function buildMetaFilter({ region, isAdmin, userRegion, search, period }) {
    const effectiveRegion = isAdmin ? region || '' : userRegion || '';
    const trimmedSearch = String(search || '').trim();

    const where = ['m.period = ?'];
    const params = [period];

    if (effectiveRegion) {
        where.push('m.region = ?');
        params.push(effectiveRegion);
    }

    if (trimmedSearch) {
        where.push('(TRIM(CAST(m.inn AS CHAR)) LIKE ? OR m.name LIKE ?)');
        params.push(`%${trimmedSearch}%`, `%${trimmedSearch}%`);
    }

    return {
        sql: `WHERE ${where.join(' AND ')}`,
        params,
    };
}

async function getLatestDate(period) {
    const key = `commissions:latest-date:${period}`;
    const cached = getCache(key);
    if (cached) return cached;

    const [rows] = await pool.query(
        `
            SELECT DATE_FORMAT(MAX(sum_date), '%Y-%m-%d') AS latest_date
            FROM saldo
            WHERE period = ?
        `,
        [period],
    );

    const result = rows[0]?.latest_date || null;
    setCache(key, result, DATES_TTL_MS);
    return result;
}

async function getTopDates(period, limit = 7) {
    const key = `commissions:top-dates:${period}:${limit}`;
    const cached = getCache(key);
    if (cached) return cached;

    const [rows] = await pool.query(
        `
            SELECT DISTINCT DATE_FORMAT(sum_date, '%Y-%m-%d') AS sum_date
            FROM saldo
            WHERE period = ?
            ORDER BY sum_date DESC
                LIMIT ?
        `,
        [period, limit],
    );

    const result = rows
        .map((row) => row.sum_date)
        .filter(Boolean);

    setCache(key, result, DATES_TTL_MS);
    return result;
}

export async function getCommissionsMeta({ isAdmin, userRegion }) {
    const key = `commissions:meta:${isAdmin ? 'admin' : `user:${userRegion || ''}`}`;
    const cached = getCache(key);
    if (cached) return cached;

    const [periodRows] = await pool.query(
        `
            SELECT id, quartal, year, is_active
            FROM periods
            ORDER BY year DESC, quartal DESC
        `,
    );

    const [regionRows] = await pool.query(
        `
            SELECT DISTINCT region
            FROM meta
            WHERE region IS NOT NULL
              AND region <> ''
            ORDER BY region ASC
        `,
    );

    const quarters = periodRows.map((row) => ({
        value: String(row.id),
        label: formatQuarterLabel(row.quartal, row.year),
        isActive: String(row.is_active) === '1',
    }));

    const result = {
        regions: isAdmin
            ? regionRows.map((row) => ({
                value: String(row.region),
                label: String(row.region),
            }))
            : userRegion
                ? [{ value: String(userRegion), label: String(userRegion) }]
                : [],
        quarters: quarters.map((item) => ({
            value: item.value,
            label: item.label,
        })),
        defaultQuarter:
            quarters.find((item) => item.isActive)?.value || quarters[0]?.value || '',
        userRegion: userRegion || '',
        isAdmin,
    };

    setCache(key, result, META_TTL_MS);
    return result;
}

export async function getCommissionsSummary({
                                                region,
                                                quarter,
                                                isAdmin,
                                                userRegion,
                                            }) {
    const key = `commissions:summary:${quarter}:${isAdmin ? region || 'all' : userRegion || ''}`;
    const cached = getCache(key);
    if (cached) return cached;

    const latestDate = await getLatestDate(quarter);
    const metaFilter = buildMetaFilter({
        region,
        isAdmin,
        userRegion,
        search: '',
        period: quarter,
    });

    const [taxpayerRows] = await pool.query(
        `
            SELECT COUNT(*) AS total
            FROM (
                     SELECT TRIM(CAST(m.inn AS CHAR)) AS inn_key
                     FROM meta m
                         ${metaFilter.sql}
                     GROUP BY TRIM(CAST(m.inn AS CHAR))
                 ) q
        `,
        metaFilter.params,
    );

    const [saldoRows] = latestDate
        ? await pool.query(
            `
                SELECT
                    COALESCE(SUM(x.amount), 0) AS ensDebt
                FROM (
                         SELECT
                             TRIM(CAST(m.inn AS CHAR)) AS inn_key,
                             COALESCE(
                                     MAX(CAST(s.saldo AS DECIMAL(18,2))),
                                     MAX(CAST(s.knsum AS DECIMAL(18,2))),
                                     0
                             ) AS amount
                         FROM meta m
                                  LEFT JOIN saldo s
                                            ON TRIM(CAST(s.inn AS CHAR)) = TRIM(CAST(m.inn AS CHAR))
                                                AND s.period = ?
                                                AND s.sum_date = ?
                             ${metaFilter.sql}
                         GROUP BY TRIM(CAST(m.inn AS CHAR))
                     ) x
            `,
            [quarter, latestDate, ...metaFilter.params],
        )
        : [[{ ensDebt: 0 }]];

    const [commissionRows] = await pool.query(
        `
            SELECT COUNT(*) AS commissionsDone
            FROM (
                     SELECT
                         TRIM(CAST(c.inn AS CHAR)) AS inn_key,
                         MAX(c.com_events) AS com_events
                     FROM commissions c
                              INNER JOIN (
                         SELECT DISTINCT TRIM(CAST(m.inn AS CHAR)) AS inn_key
                         FROM meta m
                             ${metaFilter.sql}
                     ) q
                                         ON TRIM(CAST(c.inn AS CHAR)) = q.inn_key
                     WHERE c.period = ?
                     GROUP BY TRIM(CAST(c.inn AS CHAR))
                 ) x
            WHERE LOWER(COALESCE(x.com_events, '')) LIKE '%провед%'
        `,
        [...metaFilter.params, quarter],
    );

    const [employeeRows] = await pool.query(
        `
            SELECT
                COALESCE(SUM(es.cnt_debt_emp), 0) AS employeeDebtorsCount,
                COALESCE(SUM(es.sum_debt_emp), 0) AS employeeDebtAmount
            FROM emp_stat es
                     INNER JOIN (
                SELECT DISTINCT TRIM(CAST(m.inn AS CHAR)) AS inn_key
                FROM meta m
                    ${metaFilter.sql}
            ) q
                                ON TRIM(CAST(es.inn_org AS CHAR)) = q.inn_key
            WHERE es.period = ?
        `,
        [...metaFilter.params, quarter],
    );

    const result = {
        taxpayersCount: Number(taxpayerRows[0]?.total || 0),
        ensDebt: Number(saldoRows[0]?.ensDebt || 0),
        commissionsDone: Number(commissionRows[0]?.commissionsDone || 0),
        employeeDebtorsCount: Number(employeeRows[0]?.employeeDebtorsCount || 0),
        employeeDebtAmount: Number(employeeRows[0]?.employeeDebtAmount || 0),
    };

    setCache(key, result, SUMMARY_TTL_MS);
    return result;
}

export async function getCommissionsPage({
                                             region,
                                             quarter,
                                             search,
                                             status,
                                             isAdmin,
                                             userRegion,
                                             cursor,
                                             limit,
                                         }) {
    const latestDate = await getLatestDate(quarter);
    const topDates = await getTopDates(quarter, 7);
    const metaFilter = buildMetaFilter({
        region,
        isAdmin,
        userRegion,
        search,
        period: quarter,
    });
    const decodedCursor = decodeCursor(cursor);

    const cursorSql = decodedCursor
        ? `
      AND (
        page_base.empty_rank > ?
        OR (page_base.empty_rank = ? AND page_base.sort_amount < ?)
        OR (page_base.empty_rank = ? AND page_base.sort_amount = ? AND page_base.inn > ?)
      )
    `
        : '';

    const cursorParams = decodedCursor
        ? [
            Number(decodedCursor.emptyRank),
            Number(decodedCursor.emptyRank),
            Number(decodedCursor.sortAmount),
            Number(decodedCursor.emptyRank),
            Number(decodedCursor.sortAmount),
            String(decodedCursor.inn),
        ]
        : [];

    const [pageRowsRaw] = await pool.query(
        `
            WITH base_meta AS (
                SELECT
                    TRIM(CAST(m.inn AS CHAR)) AS inn,
                    MIN(m.name) AS name,
                    MIN(m.region) AS region,
                    MIN(m.kno) AS kno
                FROM meta m
                ${metaFilter.sql}
            GROUP BY TRIM(CAST(m.inn AS CHAR))
                ),
                latest_saldo AS (
            SELECT
                bm.inn,
                MAX(CAST(s.saldo AS DECIMAL(18,2))) AS latest_saldo,
                MAX(CAST(s.knsum AS DECIMAL(18,2))) AS latest_knsum
            FROM base_meta bm
                LEFT JOIN saldo s
            ON TRIM(CAST(s.inn AS CHAR)) = bm.inn
                AND s.period = ?
                AND s.sum_date = ?
            GROUP BY bm.inn
                ),
                page_base AS (
            SELECT
                bm.inn,
                bm.name,
                bm.region,
                bm.kno,
                ls.latest_saldo,
                ls.latest_knsum,
                CASE
                WHEN ls.latest_saldo IS NULL AND ls.latest_knsum IS NULL THEN 1
                ELSE 0
                END AS empty_rank,
                COALESCE(ls.latest_saldo, ls.latest_knsum, -1) AS sort_amount
            FROM base_meta bm
                LEFT JOIN latest_saldo ls
            ON ls.inn = bm.inn
                )
            SELECT *
            FROM page_base
            WHERE 1 = 1
                ${cursorSql}
            ORDER BY page_base.empty_rank ASC, page_base.sort_amount DESC, page_base.inn ASC
                LIMIT ?
        `,
        [
            ...metaFilter.params,
            quarter,
            latestDate,
            ...cursorParams,
            limit + 1,
        ],
    );

    const hasMore = pageRowsRaw.length > limit;
    const pageRows = hasMore ? pageRowsRaw.slice(0, limit) : pageRowsRaw;

    if (!pageRows.length) {
        return {
            items: [],
            dates: topDates,
            nextCursor: null,
            hasMore: false,
        };
    }

    const pageInns = pageRows.map((row) => normalizeInn(row.inn));
    const innPlaceholders = pageInns.map(() => '?').join(',');
    const datePlaceholders = topDates.map(() => '?').join(',');

    const [balanceRows] = topDates.length
        ? await pool.query(
            `
                SELECT
                    TRIM(CAST(s.inn AS CHAR)) AS inn,
                    DATE_FORMAT(s.sum_date, '%Y-%m-%d') AS sum_date,
                    COALESCE(
                            MAX(CAST(s.saldo AS DECIMAL(18,2))),
                            MAX(CAST(s.knsum AS DECIMAL(18,2)))
                    ) AS amount
                FROM saldo s
                WHERE s.period = ?
                  AND TRIM(CAST(s.inn AS CHAR)) IN (${innPlaceholders})
                  AND DATE_FORMAT(s.sum_date, '%Y-%m-%d') IN (${datePlaceholders})
                GROUP BY TRIM(CAST(s.inn AS CHAR)), DATE_FORMAT(s.sum_date, '%Y-%m-%d')
                ORDER BY sum_date DESC
            `,
            [quarter, ...pageInns, ...topDates],
        )
        : [[]];

    const [commissionRows] = await pool.query(
        `
            SELECT
                TRIM(CAST(c.inn AS CHAR)) AS inn,
                c.com_events,
                c.com_date
            FROM commissions c
            WHERE c.period = ?
              AND TRIM(CAST(c.inn AS CHAR)) IN (${innPlaceholders})
            ORDER BY c.com_date DESC
        `,
        [quarter, ...pageInns],
    );

    const [eventRows] = await pool.query(
        `
            SELECT
                TRIM(CAST(e.inn AS CHAR)) AS inn,
                e.events,
                e.action_date
            FROM events e
            WHERE e.period = ?
              AND TRIM(CAST(e.inn AS CHAR)) IN (${innPlaceholders})
            ORDER BY e.action_date DESC
        `,
        [quarter, ...pageInns],
    );

    const [fileRows] = await pool.query(
        `
            SELECT
                TRIM(CAST(f.inn AS CHAR)) AS inn,
                f.original_filename,
                f.uploaded_at
            FROM files f
            WHERE f.period = ?
              AND TRIM(CAST(f.inn AS CHAR)) IN (${innPlaceholders})
            ORDER BY f.uploaded_at DESC, f.id DESC
        `,
        [quarter, ...pageInns],
    );

    const latestCommissionByInn = new Map();
    for (const row of commissionRows) {
        if (!latestCommissionByInn.has(row.inn)) {
            latestCommissionByInn.set(row.inn, row);
        }
    }

    const latestEventByInn = new Map();
    for (const row of eventRows) {
        if (!latestEventByInn.has(row.inn)) {
            latestEventByInn.set(row.inn, row);
        }
    }

    const latestFileByInn = new Map();
    for (const row of fileRows) {
        if (!latestFileByInn.has(row.inn)) {
            latestFileByInn.set(row.inn, row);
        }
    }

    const balancesByInn = new Map();
    for (const row of balanceRows) {
        if (!row.sum_date) continue;

        const current = balancesByInn.get(row.inn) || [];
        current.push({
            date: row.sum_date,
            amount: Number(row.amount),
        });
        balancesByInn.set(row.inn, current);
    }

    let items = pageRows.map((row) => {
        const inn = normalizeInn(row.inn);
        const latestCommission = latestCommissionByInn.get(inn);
        const latestEvent = latestEventByInn.get(inn);
        const latestFile = latestFileByInn.get(inn);

        return {
            inn,
            name: row.name || '',
            region: row.region || '',
            kno: row.kno || '',
            balances: (balancesByInn.get(inn) || []).sort((a, b) =>
                b.date.localeCompare(a.date),
            ),
            commissionStatus: mapCommissionStatus(latestCommission?.com_events),
            interactionStatus: mapInteractionStatus(latestEvent?.events),
            protocolFileName: normalizeProtocolName(latestFile?.original_filename),
            emptyRank: Number(row.empty_rank),
            sortAmount: Number(row.sort_amount),
        };
    });

    if (status) {
        items = items.filter((item) => item.commissionStatus === status);
    }

    const last = pageRows[pageRows.length - 1];
    const nextCursor = hasMore
        ? encodeCursor({
            emptyRank: Number(last.empty_rank),
            sortAmount: Number(last.sort_amount),
            inn: normalizeInn(last.inn),
        })
        : null;

    return {
        items,
        dates: topDates,
        nextCursor,
        hasMore,
    };
}

function assertRegionAccess({ requestedRegion, isAdmin, userRegion }) {
    if (isAdmin) return;
    if (requestedRegion && userRegion && requestedRegion !== userRegion) {
        const error = new Error('Нет доступа к чужому региону');
        error.status = 403;
        throw error;
    }
}

async function getBaseMetaRow({ inn, quarter, region, isAdmin, userRegion }) {
    assertRegionAccess({
        requestedRegion: region,
        isAdmin,
        userRegion,
    });

    const params = [inn, quarter];
    let regionSql = '';

    if (isAdmin) {
        if (region) {
            regionSql = 'AND m.region = ?';
            params.push(region);
        }
    } else if (userRegion) {
        regionSql = 'AND m.region = ?';
        params.push(userRegion);
    }

    const [rows] = await pool.query(
        `
      SELECT
        TRIM(CAST(m.inn AS CHAR)) AS inn,
        m.name,
        m.region,
        m.kno
      FROM meta m
      WHERE TRIM(CAST(m.inn AS CHAR)) = ?
        AND m.period = ?
        ${regionSql}
      LIMIT 1
    `,
        params,
    );

    return rows[0] || null;
}

export async function getCommissionDetails({
                                               inn,
                                               quarter,
                                               region,
                                               isAdmin,
                                               userRegion,
                                           }) {
    const metaRow = await getBaseMetaRow({
        inn,
        quarter,
        region,
        isAdmin,
        userRegion,
    });

    if (!metaRow) {
        const error = new Error('Запись не найдена');
        error.status = 404;
        throw error;
    }

    const [commissionRows] = await pool.query(
        `
      SELECT
        id,
        com_events,
        com_date
      FROM commissions
      WHERE TRIM(CAST(inn AS CHAR)) = ?
        AND period = ?
      ORDER BY com_date DESC, id DESC
      LIMIT 1
    `,
        [inn, quarter],
    );

    const [eventRows] = await pool.query(
        `
      SELECT
        id,
        events,
        action_date
      FROM events
      WHERE TRIM(CAST(inn AS CHAR)) = ?
        AND period = ?
      ORDER BY action_date DESC, id DESC
      LIMIT 1
    `,
        [inn, quarter],
    );

    const [fileRows] = await pool.query(
        `
      SELECT
        id,
        original_filename,
        uploaded_at
      FROM files
      WHERE TRIM(CAST(inn AS CHAR)) = ?
        AND period = ?
      ORDER BY uploaded_at DESC, id DESC
      LIMIT 1
    `,
        [inn, quarter],
    );

    const [balanceRows] = await pool.query(
        `
      SELECT
        DATE_FORMAT(sum_date, '%Y-%m-%d') AS sum_date,
        saldo,
        knsum
      FROM saldo
      WHERE TRIM(CAST(inn AS CHAR)) = ?
        AND period = ?
      ORDER BY sum_date DESC
      LIMIT 7
    `,
        [inn, quarter],
    );

    return {
        inn: metaRow.inn,
        name: metaRow.name || '',
        region: metaRow.region || '',
        kno: metaRow.kno || '',
        commission: {
            id: commissionRows[0]?.id ?? null,
            comEvents: commissionRows[0]?.com_events ?? '',
            comDate: commissionRows[0]?.com_date ? toIsoDate(commissionRows[0].com_date) : '',
        },
        event: {
            id: eventRows[0]?.id ?? null,
            events: eventRows[0]?.events ?? '',
            actionDate: eventRows[0]?.action_date ? toIsoDate(eventRows[0].action_date) : '',
        },
        file: {
            id: fileRows[0]?.id ?? null,
            originalFilename: fileRows[0]?.original_filename ?? '',
            uploadedAt: fileRows[0]?.uploaded_at ? toIsoDate(fileRows[0].uploaded_at) : '',
        },
        balances: balanceRows.map((row) => ({
            date: row.sum_date,
            saldo: row.saldo === null ? null : Number(row.saldo),
            knsum: row.knsum === null ? null : Number(row.knsum),
        })),
    };
}

export async function updateCommissionDetails({
                                                  inn,
                                                  quarter,
                                                  region,
                                                  isAdmin,
                                                  userRegion,
                                                  payload,
                                              }) {
    const metaRow = await getBaseMetaRow({
        inn,
        quarter,
        region,
        isAdmin,
        userRegion,
    });

    if (!metaRow) {
        const error = new Error('Запись не найдена');
        error.status = 404;
        throw error;
    }

    const {
        commissionStatus = '',
        commissionDate = '',
        interactionStatus = '',
    } = payload || {};

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [existingCommissionRows] = await connection.query(
            `
        SELECT id
        FROM commissions
        WHERE TRIM(CAST(inn AS CHAR)) = ?
          AND period = ?
        ORDER BY com_date DESC, id DESC
        LIMIT 1
      `,
            [inn, quarter],
        );

        if (existingCommissionRows.length) {
            await connection.query(
                `
          UPDATE commissions
          SET
            com_events = ?,
            com_date = ?
          WHERE id = ?
        `,
                [
                    commissionStatus || null,
                    commissionDate || null,
                    existingCommissionRows[0].id,
                ],
            );
        } else if (commissionStatus || commissionDate) {
            await connection.query(
                `
          INSERT INTO commissions (
            inn,
            com_events,
            com_date,
            period
          )
          VALUES (?, ?, ?, ?)
        `,
                [inn, commissionStatus || null, commissionDate || null, quarter],
            );
        }

        const [existingEventRows] = await connection.query(
            `
        SELECT id
        FROM events
        WHERE TRIM(CAST(inn AS CHAR)) = ?
          AND period = ?
        ORDER BY action_date DESC, id DESC
        LIMIT 1
      `,
            [inn, quarter],
        );

        if (existingEventRows.length) {
            await connection.query(
                `
          UPDATE events
          SET
            events = ?
          WHERE id = ?
        `,
                [interactionStatus || null, existingEventRows[0].id],
            );
        } else if (interactionStatus) {
            await connection.query(
                `
          INSERT INTO events (
            inn,
            events,
            action_date,
            period
          )
          VALUES (?, ?, ?, ?)
        `,
                [inn, interactionStatus || null, commissionDate || null, quarter],
            );
        }

        await connection.commit();

        return await getCommissionDetails({
            inn,
            quarter,
            region,
            isAdmin,
            userRegion,
        });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}