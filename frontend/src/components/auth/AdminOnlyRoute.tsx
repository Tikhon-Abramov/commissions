import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export function AdminOnlyRoute() {
    const { userKey, isAdmin } = useAppSelector((state) => state.auth);

    if (!userKey) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/commissions" replace />;
    }

    return <Outlet />;
}