import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';

const UpdatePasswordPage = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { api } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await api.put('/api/users/update-password', { oldPassword, newPassword });
            setSuccess(response.data.message);
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        }
    };

    return (
        <div className="dashboard-container">
            <Header />
            <main className="dashboard-content">
                <div className="auth-form" style={{ maxWidth: '500px', margin: 'auto' }}>
                    <h2>Update Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Old Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}
                        <button type="submit" className="btn-primary">Update Password</button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default UpdatePasswordPage;
