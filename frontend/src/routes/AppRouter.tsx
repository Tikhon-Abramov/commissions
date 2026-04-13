import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { AuthGuard } from '../components/auth/AuthGuard';
import { AdminOnlyRoute } from '../components/auth/AdminOnlyRoute';

import { LoginPage } from '../pages/LoginPage';
import { AdminPage } from '../pages/AdminPage';
import { CommissionsPage } from '../pages/CommissionsPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { FeedbackPage } from '../pages/FeedbackPage';
import { RatingPage } from '../pages/RatingPage';
import { SecondLevelDebtPage } from '../pages/SecondLevelDebtPage';

export function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<AuthGuard />}>
                <Route path="/" element={<AppShell />}>
                    <Route index element={<Navigate to="/commissions" replace />} />

                    <Route path="commissions" element={<CommissionsPage />} />
                    <Route path="mo" element={<SecondLevelDebtPage />} />
                    <Route path="rating" element={<RatingPage />} />
                    <Route path="documents" element={<DocumentsPage />} />
                    <Route path="feedback" element={<FeedbackPage />} />

                    <Route element={<AdminOnlyRoute />}>
                        <Route path="admin" element={<AdminPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/commissions" replace />} />
                </Route>
            </Route>
        </Routes>
    );
}