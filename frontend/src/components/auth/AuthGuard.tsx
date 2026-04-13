import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

export function AuthGuard() {
    const dispatch = useAppDispatch();
    const location = useLocation();

    const { userKey, isAdmin } = useAppSelector((state) => state.auth);
    const serviceModeEnabled = useAppSelector(
        (state) => state.admin.serviceMode.enabled
    );

    useEffect(() => {
        if (serviceModeEnabled && userKey && !isAdmin) {
            dispatch(logout());
        }
    }, [serviceModeEnabled, userKey, isAdmin, dispatch]);

    if (!userKey) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (serviceModeEnabled && !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}