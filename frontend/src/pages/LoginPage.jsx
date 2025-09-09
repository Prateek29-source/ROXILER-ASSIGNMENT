import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Clear errors when form data changes
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setErrors({});
        }
    }, [formData]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await login(formData.email.trim(), formData.password);
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to log in. Please check your credentials.';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={errors.email ? 'error' : ''}
                                placeholder="Enter your email"
                                autoComplete="email"
                                autoFocus
                                disabled={isLoading}
                            />
                            <span className="input-icon">📧</span>
                        </div>
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleInputChange}
                                className={errors.password ? 'error' : ''}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                disabled={isLoading}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.password && <span className="field-error">{errors.password}</span>}
                    </div>

                    {errors.general && (
                        <div className="error-message" role="alert">
                            {errors.general}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner small"></span>
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-links">
                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-link">
                            Create Account
                        </Link>
                    </p>
                    <p className="auth-switch">
                        Want to own a store?{' '}
                        <Link to="/signup-owner" className="auth-link">
                            Register as Store Owner
                        </Link>
                    </p>
                </div>

                <div className="auth-footer">
                    <p className="demo-info">
                        <strong>Demo Credentials:</strong><br />
                        Admin: admin@example.com / Password123!<br />
                        User: user@example.com / user123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
