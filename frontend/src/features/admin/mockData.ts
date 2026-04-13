import type { AdminUser, ServiceModeState } from '../../types/admin';

export const serviceModeInitial: ServiceModeState = {
    enabled: false,
    message: 'Проводятся технические работы. Вход для пользователей временно недоступен.',
};

export const adminUsersMock: AdminUser[] = [
    {
        id: 'u-1',
        login: 'admin',
        password: 'admin123',
        lastName: 'Системный',
        firstName: 'Администратор',
        middleName: '',
        role: 'admin',
        region: '',
        isActive: true,
    },
    {
        id: 'u-2',
        login: 'moscow_user',
        password: 'user123',
        lastName: 'Иванов',
        firstName: 'Иван',
        middleName: 'Иванович',
        role: 'user',
        region: '77',
        isActive: true,
    },
    {
        id: 'u-3',
        login: 'spb_user',
        password: 'user123',
        lastName: 'Петров',
        firstName: 'Пётр',
        middleName: 'Петрович',
        role: 'user',
        region: '78',
        isActive: true,
    },
    {
        id: 'u-4',
        login: 'mo_user',
        password: 'user123',
        lastName: 'Сидорова',
        firstName: 'Анна',
        middleName: 'Олеговна',
        role: 'user',
        region: '50',
        isActive: false,
    },
];