import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';

const UserDashboard = () => {
    const [stores, setStores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('name'); // 'name' or 'address'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { api } = useAuth();

    const fetchStores = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (searchTerm.trim()) {
                params.append(searchType, searchTerm.trim());
            }
            const response = await api.get(`/api/stores?${params.toString()}`);
            setStores(response.data);
        } catch (err) {
            setError('Failed to fetch stores. Please try again.');
            console.error('Error fetching stores:', err);
        } finally {
            setLoading(false);
        }
    }, [api, searchTerm, searchType]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const handleRatingSubmit = async (storeId, rating) => {
        if (!rating || rating < 1 || rating > 5) {
            setError('Please select a valid rating between 1 and 5.');
            return;
        }

        try {
            await api.post(`/api/stores/${storeId}/ratings`, { rating });
            setSuccessMessage('Rating submitted successfully!');
            setError('');
            // Refetch stores to show the updated rating
            fetchStores();
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to submit rating. Please try again.');
            console.error('Error submitting rating:', err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchStores();
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchType('name');
    };

    return (
        <div className="dashboard-container">
            <Header />
            <main className="dashboard-content">
                <div className="dashboard-header-section">
                    <h2>All Stores</h2>
                    <p className="dashboard-subtitle">Discover and rate your favorite stores</p>
                </div>

                <form onSubmit={handleSearch} className="search-bar">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder={`Search by store ${searchType}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="search-select"
                        >
                            <option value="name">Name</option>
                            <option value="address">Address</option>
                        </select>
                    </div>
                    <div className="search-actions">
                        <button type="submit" className="btn-primary search-btn">
                            Search
                        </button>
                        {(searchTerm || searchType !== 'name') && (
                            <button type="button" onClick={clearSearch} className="btn-secondary clear-btn">
                                Clear
                            </button>
                        )}
                    </div>
                </form>

                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading stores...</p>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {!loading && stores.length === 0 && searchTerm && (
                    <div className="no-results">
                        <h3>No stores found</h3>
                        <p>Try adjusting your search criteria or <button onClick={clearSearch} className="link-btn">view all stores</button></p>
                    </div>
                )}

                <div className="store-list">
                    {!loading && stores.map(store => (
                        <StoreCard
                            key={store.id}
                            store={store}
                            onRate={handleRatingSubmit}
                            isLoading={loading}
                        />
                    ))}
                </div>

                {!loading && stores.length > 0 && (
                    <div className="store-count">
                        Showing {stores.length} store{stores.length !== 1 ? 's' : ''}
                    </div>
                )}
            </main>
        </div>
    );
};

// StoreCard Component
const StoreCard = ({ store, onRate, isLoading }) => {
    const [rating, setRating] = useState(store.userSubmittedRating || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update rating when store data changes
    useEffect(() => {
        setRating(store.userSubmittedRating || '');
    }, [store.userSubmittedRating]);

    const handleRateClick = async () => {
        const ratingValue = Number(rating);
        if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
            alert("Please select a rating between 1 and 5.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onRate(store.id, ratingValue);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push('★');
        }
        if (hasHalfStar) {
            stars.push('☆');
        }
        while (stars.length < 5) {
            stars.push('☆');
        }

        return stars.join('');
    };

    return (
        <div className="store-card">
            <div className="store-header">
                <h3>{store.name}</h3>
                <div className="store-rating-display">
                    {store.overallRating && store.overallRating !== 'N/A' && (
                        <div className="overall-rating">
                            <span className="stars">{getRatingStars(store.overallRating)}</span>
                            <span className="rating-number">{parseFloat(store.overallRating).toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>

            <p className="store-address">{store.address}</p>

            <div className="store-rating-info">
                <div className="rating-item">
                    <span className="rating-label">Overall Rating:</span>
                    <span className="rating-value">
                        {store.overallRating && store.overallRating !== 'N/A' ? `${parseFloat(store.overallRating).toFixed(1)}/5` : 'No ratings yet'}
                    </span>
                </div>
                <div className="rating-item">
                    <span className="rating-label">Your Rating:</span>
                    <span className="rating-value">
                        {store.userSubmittedRating ? `${store.userSubmittedRating}/5` : 'Not rated'}
                    </span>
                </div>
            </div>

            <div className="rating-input-area">
                <div className="rating-select-group">
                    <label htmlFor={`rating-${store.id}`} className="sr-only">Rate this store</label>
                    <select
                        id={`rating-${store.id}`}
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="rating-select"
                        disabled={isSubmitting}
                    >
                        <option value="">Select rating...</option>
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                    </select>
                </div>
                <button
                    onClick={handleRateClick}
                    className="btn-primary rating-btn"
                    disabled={isSubmitting || !rating}
                >
                    {isSubmitting ? 'Submitting...' : (store.userSubmittedRating ? 'Update Rating' : 'Submit Rating')}
                </button>
            </div>
        </div>
    );
};

export default UserDashboard;
