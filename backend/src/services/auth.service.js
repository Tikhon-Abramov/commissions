import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { signToken } from '../utils/jwt.js';

async function getSettingValue(param) {
    const [rows] = await pool.query(
        `
            SELECT value
            FROM settings
            WHERE param = ?
                LIMIT 1
        `,
        [param]
    );

    return rows[0]?.value ?? null;
}

export async function getServiceModeState() {
    const enabledValue = await getSettingValue('maintenance');
    const messageValue = await getSettingValue('maint_text');

    return {
        enabled: String(enabledValue || '0') === '1',
        message:
            messageValue ||
            'Проводятся технические работы. Вход для пользователей временно недоступен.',
    };
}

function normalizePhpPasswordHash(hash) {
    if (!hash) return '';
    if (hash.startsWith('$2y$')) {
        return `$2a$${hash.slice(4)}`;
    }
    return hash;
}

async function verifyLegacyPassword(plainPassword, storedHash) {
    if (!storedHash) return false;

    const normalizedHash = normalizePhpPasswordHash(String(storedHash));

    if (
        normalizedHash.startsWith('$2a$') ||
        normalizedHash.startsWith('$2b$')
    ) {
        return bcrypt.compare(plainPassword, normalizedHash);
    }

    return String(storedHash) === String(plainPassword);
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

    const passwordMatches = await verifyLegacyPassword(password, user.password);

    if (!passwordMatches) {
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