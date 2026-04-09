import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { CommissionsPage } from '../pages/CommissionsPage';
import { MoPage } from '../pages/MoPage';
import { RatingPage } from '../pages/RatingPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/commissions" replace />} />
        <Route path="commissions" element={<CommissionsPage />} />
        <Route path="mo" element={<MoPage />} />
        <Route path="rating" element={<RatingPage />} />
      </Route>
    </Routes>
  );
}
