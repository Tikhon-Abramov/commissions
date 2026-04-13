export type UserRole = 'admin' | 'user';

export type AdminUser = {
    id: string;
    login: string;
    password: string;
    lastName: string;
    firstName: string;
    middleName: string;
    role: UserRole;
    region: string;
    isActive: boolean;
};

export type ServiceModeState = {
    enabled: boolean;
    message: string;
};