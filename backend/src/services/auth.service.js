import { pool } from '../db/pool.js';
import { signToken } from '../utils/jwt.js';

async function getSettingValue(parameter) {
    const [rows] = await pool.query(
        `
      SELECT value
      FROM settings
      WHERE parameter = ?
      LIMIT 1
    `,
        [parameter]
    );

    return rows[0]?.value ?? null;
}

export async function getServiceModeState() {
    const enabledValue = await getSettingValue('maintenance');
    const messageValue = await getSettingValue('maintenance_text');

    return {
        enabled: String(enabledValue || '0') === '1',
        message:
            messageValue ||
            'Проводятся технические работы. Вход для пользователей временно недоступен.',
    };
}

export async function loginUser({ username, password, adminOnly = false }) {
    const [rows] = await pool.query(
        `
      SELECT
        id,
        username,
        password,
        surname,
        name,
        patronymic,
        isAdmin,
        region
      FROM users
      WHERE username = ?
      LIMIT 1
    `,
        [username]
    );

    const user = rows[0];

    if (!user) {
        return {
            success: false,
            status: 401,
            message: 'Неверный логин или пароль',
        };
    }

    // legacy-логика: сравнение с текущим форматом БД
    if (String(user.password) !== String(password)) {
        return {
            success: false,
            status: 401,
            message: 'Неверный логин или пароль',
        };
    }

    const serviceMode = await getServiceModeState();

    if (serviceMode.enabled && Number(user.isAdmin) !== 1) {
        return {
            success: false,
            status: 403,
            code: 'SERVICE_MODE_ENABLED',
            message: serviceMode.message,
        };
    }

    if (adminOnly && Number(user.isAdmin) !== 1) {
        return {
            success: false,
            status: 403,
            message: 'Войти может только администратор',
        };
    }

    const normalizedUser = {
        id: user.id,
        username: user.username,
        fullName: `${user.surname || ''} ${user.name || ''} ${user.patronymic || ''}`.trim(),
        surname: user.surname || '',
        name: user.name || '',
        patronymic: user.patronymic || '',
        isAdmin: Number(user.isAdmin) === 1,
        role: Number(user.isAdmin) === 1 ? 'admin' : 'user',
        region: Number(user.isAdmin) === 1 ? null : user.region,
    };

    const token = signToken(normalizedUser);

    return {
        success: true,
        token,
        user: normalizedUser,
        serviceMode,
    };
}