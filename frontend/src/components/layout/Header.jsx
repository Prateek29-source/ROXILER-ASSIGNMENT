import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'Administrator';
            case 'STORE_OWNER':
                return 'Store Owner';
            case 'USER':
                return 'User';
            default:
                return role;
        }
    };

    return (
        <header className="dashboard-header">
            <div className="header-content">
                <div className="header-brand">
                    <Link to="/dashboard" className="brand-link" onClick={closeMenu}>
                        <h1>Store Ratings</h1>
                    </Link>
                </div>

                {user && (
                    <div className="header-actions">
                        {/* Desktop Navigation */}
                        <nav className="desktop-nav">
                            <div className="user-greeting">
                                <span className="welcome-text">Welcome,</span>
                                <span className="user-name">{user.name}</span>
                                <span className="user-role">({getRoleDisplayName(user.role)})</span>
                            </div>
                            <div className="nav-buttons">
                                <Link to="/update-password">
                                    <button className="btn-secondary nav-btn">
                                        <span className="btn-icon">🔒</span>
                                        Update Password
                                    </button>
                                </Link>
                                <button onClick={handleLogout} className="btn-secondary nav-btn logout-btn">
                                    <span className="btn-icon">🚪</span>
                                    Logout
                                </button>
                            </div>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
                            onClick={toggleMenu}
                            aria-label="Toggle navigation menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Navigation Menu */}
            {user && isMenuOpen && (
                <div className="mobile-nav-menu">
                    <div className="mobile-user-info">
                        <div className="mobile-user-name">{user.name}</div>
                        <div className="mobile-user-role">{getRoleDisplayName(user.role)}</div>
                    </div>
                    <nav className="mobile-nav-links">
                        <Link to="/update-password" onClick={closeMenu} className="mobile-nav-link">
                            <span className="nav-icon">🔒</span>
                            Update Password
                        </Link>
                        <button onClick={handleLogout} className="mobile-nav-link logout-link">
                            <span className="nav-icon">🚪</span>
                            Logout
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
