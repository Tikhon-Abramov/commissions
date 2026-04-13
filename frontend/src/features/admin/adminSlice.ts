import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser, ServiceModeState, UserRole } from '../../types/admin';
import { adminUsersMock, serviceModeInitial } from './mockData';

type AdminUserDraft = {
    id?: string;
    login: string;
    password: string;
    lastName: string;
    firstName: string;
    middleName: string;
    role: UserRole;
    region: string;
    isActive: boolean;
};

type AdminState = {
    serviceMode: ServiceModeState;
    users: AdminUser[];
    selectedUserId: string | null;
    isUserModalOpen: boolean;
    modalMode: 'create' | 'edit';
    userDraft: AdminUserDraft;
};

const emptyDraft: AdminUserDraft = {
    login: '',
    password: '',
    lastName: '',
    firstName: '',
    middleName: '',
    role: 'user',
    region: '',
    isActive: true,
};

const initialState: AdminState = {
    serviceMode: serviceModeInitial,
    users: adminUsersMock,
    selectedUserId: null,
    isUserModalOpen: false,
    modalMode: 'create',
    userDraft: emptyDraft,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        toggleServiceMode(state) {
            state.serviceMode.enabled = !state.serviceMode.enabled;
        },

        setServiceModeMessage(state, action: PayloadAction<string>) {
            state.serviceMode.message = action.payload;
        },

        openCreateUserModal(state) {
            state.modalMode = 'create';
            state.userDraft = emptyDraft;
            state.isUserModalOpen = true;
        },

        openEditUserModal(state, action: PayloadAction<string>) {
            const user = state.users.find((item) => item.id === action.payload);
            if (!user) return;

            state.modalMode = 'edit';
            state.selectedUserId = user.id;
            state.userDraft = { ...user };
            state.isUserModalOpen = true;
        },

        closeUserModal(state) {
            state.isUserModalOpen = false;
            state.selectedUserId = null;
            state.userDraft = emptyDraft;
        },

        updateUserDraft(state, action: PayloadAction<Partial<AdminUserDraft>>) {
            state.userDraft = {
                ...state.userDraft,
                ...action.payload,
            };
        },

        saveUserDraft(state) {
            const draft = state.userDraft;

            if (!draft.login.trim() || !draft.password.trim() || !draft.lastName.trim() || !draft.firstName.trim()) {
                return;
            }

            if (state.modalMode === 'create') {
                state.users.unshift({
                    id: `u-${Date.now()}`,
                    login: draft.login.trim(),
                    password: draft.password,
                    lastName: draft.lastName.trim(),
                    firstName: draft.firstName.trim(),
                    middleName: draft.middleName.trim(),
                    role: draft.role,
                    region: draft.role === 'admin' ? '' : draft.region,
                    isActive: draft.isActive,
                });
            } else if (state.modalMode === 'edit' && state.selectedUserId) {
                state.users = state.users.map((user) =>
                    user.id === state.selectedUserId
                        ? {
                            ...user,
                            login: draft.login.trim(),
                            password: draft.password,
                            lastName: draft.lastName.trim(),
                            firstName: draft.firstName.trim(),
                            middleName: draft.middleName.trim(),
                            role: draft.role,
                            region: draft.role === 'admin' ? '' : draft.region,
                            isActive: draft.isActive,
                        }
                        : user,
                );
            }

            state.isUserModalOpen = false;
            state.selectedUserId = null;
            state.userDraft = emptyDraft;
        },

        toggleUserActive(state, action: PayloadAction<string>) {
            state.users = state.users.map((user) =>
                user.id === action.payload
                    ? {
                        ...user,
                        isActive: !user.isActive,
                    }
                    : user,
            );
        },
    },
});

export const {
    toggleServiceMode,
    setServiceModeMessage,
    openCreateUserModal,
    openEditUserModal,
    closeUserModal,
    updateUserDraft,
    saveUserDraft,
    toggleUserActive,
} = adminSlice.actions;

export default adminSlice.reducer;