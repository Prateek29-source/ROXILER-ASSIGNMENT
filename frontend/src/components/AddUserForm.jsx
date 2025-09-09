import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FormInput from './FormInput';

const AddUserForm = ({ onUserAdded, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'USER',
    });
    const [error, setError] = useState('');
    const { api } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/api/users', formData);
            onUserAdded();
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to add user.');
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Add New User</h2>
                <form onSubmit={handleSubmit}>
                    <FormInput label="Name" name="name" value={formData.name} onChange={handleChange} />
                    <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <FormInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
                    <div className="form-group">
                        <label>Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="USER">User</option>
                            <option value="STORE_OWNER">Store Owner</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Add User</button>
                        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserForm;
