import { pool } from '../db/pool.js';

const tableColumnsCache = new Map();

export async function getTableColumns(tableName) {
    if (tableColumnsCache.has(tableName)) {
        return tableColumnsCache.get(tableName);
    }

    const [rows] = await pool.query(
        `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `,
        [tableName]
    );

    const columns = rows.map((row) => row.COLUMN_NAME);
    tableColumnsCache.set(tableName, columns);
    return columns;
}

export async function pickColumn(tableName, candidates, options = {}) {
    const columns = await getTableColumns(tableName);
    const found = candidates.find((candidate) => columns.includes(candidate));

    if (found) return found;

    if (options.required === false) return null;

    throw new Error(
        `Не удалось определить колонку для таблицы "${tableName}". Проверялись: ${candidates.join(', ')}`
    );
}