import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FormInput from './FormInput';

const AddStoreForm = ({ onStoreAdded, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        owner_id: ''
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
            await api.post('/api/stores', formData);
            onStoreAdded();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add store.');
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Add New Store</h2>
                <form onSubmit={handleSubmit}>
                    <FormInput label="Store Name" name="name" value={formData.name} onChange={handleChange} />
                    <FormInput label="Store Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <div className="form-group">
                        <label>Store Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} required />
                    </div>
                    <FormInput label="Owner ID (Optional)" name="owner_id" type="number" value={formData.owner_id} onChange={handleChange} required={false} />
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Add Store</button>
                        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStoreForm;
