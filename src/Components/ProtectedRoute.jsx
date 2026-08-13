import { Navigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext.jsx'
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, loading, currentUser } = useAuth();

    if (loading) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole) {
        const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const userRole = currentUser?.accountRole || currentUser?.role;

        if (!userRole || !allowed.includes(userRole)) {
            // Redirect based on user role if they are logged in but unauthorized for this specific page
            if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
            if (userRole === 'staff') return <Navigate to="/staff/dashboard" replace />;
            return <Navigate to="/" replace />;
        }
    }

    return (
        <>
            {children}
        </>
    )
}

export default ProtectedRoute
