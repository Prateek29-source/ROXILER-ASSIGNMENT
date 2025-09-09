import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Page Components (we will create these next)
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import StoreOwnerSignupPage from './pages/StoreOwnerSignupPage';

// A component to protect routes
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, token } = useAuth();

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // If user's role is not allowed, redirect to their default dashboard
        return <Navigate to="/dashboard" />;
    }

    return children;
};


function App() {
    const { user } = useAuth();

    // This component redirects user to their specific dashboard after login
    const DashboardRedirect = () => {
        if (!user) return <Navigate to="/login" />;

        switch (user.role) {
            case 'ADMIN':
                return <Navigate to="/admin" />;
            case 'USER':
                return <Navigate to="/user" />;
            case 'STORE_OWNER':
                return <Navigate to="/store-owner" />;
            default:
                return <Navigate to="/login" />;
        }
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />
            <Route path="/signup-owner" element={!user ? <StoreOwnerSignupPage /> : <Navigate to="/dashboard" />} />

            {/* Redirect route */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Protected Routes */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/user" element={
                <ProtectedRoute allowedRoles={['USER']}>
                    <UserDashboard />
                </ProtectedRoute>
            } />
            <Route path="/store-owner" element={
                <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                    <StoreOwnerDashboard />
                </ProtectedRoute>
            } />
            <Route path="/update-password" element={
                <ProtectedRoute allowedRoles={['USER', 'STORE_OWNER', 'ADMIN']}>
                    <UpdatePasswordPage />
                </ProtectedRoute>
            } />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
    );
}

export default App;
