import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const StoreOwnerSignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: '',
        storeName: '',
        storeEmail: '',
        storeAddress: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/api/auth/register-owner', formData);
            setSuccess('Registration successful! Please log in.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sign up. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form" style={{maxWidth: '600px'}}>
                <h2>Register as a Store Owner</h2>
                <form onSubmit={handleSubmit}>
                    <h3>Your Details</h3>
                    <div className="form-group">
                        <label>Your Name</label>
                        <input type="text" name="name" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Your Email</label>
                        <input type="email" name="email" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Your Address</label>
                        <textarea name="address" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" onChange={handleChange} required />
                    </div>

                    <h3 style={{marginTop: '2rem'}}>Your Store's Details</h3>
                     <div className="form-group">
                        <label>Store Name</label>
                        <input type="text" name="storeName" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Store Email</label>
                        <input type="email" name="storeEmail" onChange={handleChange} required />
                    </div>
                     <div className="form-group">
                        <label>Store Address</label>
                        <textarea name="storeAddress" onChange={handleChange} required />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <button type="submit" className="btn-primary">Register Store</button>
                </form>
                 <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default StoreOwnerSignupPage;
