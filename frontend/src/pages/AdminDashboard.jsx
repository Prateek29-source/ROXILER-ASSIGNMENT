import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import AddUserForm from '../components/AddUserForm';
import AddStoreForm from '../components/AddStoreForm';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { api } = useAuth();

    // State for forms
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [showAddStoreForm, setShowAddStoreForm] = useState(false);

    // Filters and sorting state
    const [userFilters, setUserFilters] = useState({ name: '', email: '', role: '' });
    const [storeFilters, setStoreFilters] = useState({ name: '', address: '' });
    const [userSort, setUserSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });
    const [storeSort, setStoreSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const userParams = new URLSearchParams({ ...userFilters, ...userSort }).toString();
            const storeParams = new URLSearchParams({ ...storeFilters, ...storeSort }).toString();

            const [statsRes, usersRes, storesRes] = await Promise.all([
                api.get('/api/stores/dashboard-stats'),
                api.get(`/api/users?${userParams}`),
                api.get(`/api/stores?${storeParams}`)
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setStores(storesRes.data);
        } catch (err) {
            setError('Failed to fetch dashboard data.');
        } finally {
            setLoading(false);
        }
    }, [api, userFilters, storeFilters, userSort, storeSort]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUserFilterChange = (e) => {
        setUserFilters({ ...userFilters, [e.target.name]: e.target.value });
    };

    const handleStoreFilterChange = (e) => {
        setStoreFilters({ ...storeFilters, [e.target.name]: e.target.value });
    };

    if (loading) {
        return (
             <div className="dashboard-container">
                <Header />
                <main className="dashboard-content"><p>Loading admin dashboard...</p></main>
            </div>
        );
    }
     if (error) {
        return (
             <div className="dashboard-container">
                <Header />
                <main className="dashboard-content"><p className="error-message">{error}</p></main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Header />
            <main className="dashboard-content">
                {showAddUserForm && <AddUserForm onUserAdded={() => { setShowAddUserForm(false); fetchData(); }} onCancel={() => setShowAddUserForm(false)} />}
                {showAddStoreForm && <AddStoreForm onStoreAdded={() => { setShowAddStoreForm(false); fetchData(); }} onCancel={() => setShowAddStoreForm(false)} />}

                <h2>Admin Dashboard</h2>
                
                <div className="stats-grid">
                    <div className="stats-card">
                        <h3>Total Users</h3>
                        <p className="stat-number">{stats.totalUsers}</p>
                    </div>
                    <div className="stats-card">
                        <h3>Total Stores</h3>
                        <p className="stat-number">{stats.totalStores}</p>
                    </div>
                    <div className="stats-card">
                        <h3>Total Ratings</h3>
                        <p className="stat-number">{stats.totalRatings}</p>
                    </div>
                </div>

                <h3>Manage Users</h3>
                <button onClick={() => setShowAddUserForm(true)} className="btn-primary">Add User</button>
                <div className="search-bar">
                    <input type="text" name="name" placeholder="Filter by name..." onChange={handleUserFilterChange} />
                    <input type="text" name="email" placeholder="Filter by email..." onChange={handleUserFilterChange} />
                    <select name="role" onChange={handleUserFilterChange}>
                        <option value="">All Roles</option>
                        <option value="USER">User</option>
                        <option value="STORE_OWNER">Store Owner</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <div className="table-container">
                     <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Role</th>
                                <th>Store Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.address}</td>
                                    <td>{user.role}</td>
                                    <td>{user.role === 'STORE_OWNER' ? (user.storeRating || 'N/A') : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3>Manage Stores</h3>
                <button onClick={() => setShowAddStoreForm(true)} className="btn-primary">Add Store</button>
                <div className="search-bar">
                    <input type="text" name="name" placeholder="Filter by name..." onChange={handleStoreFilterChange} />
                    <input type="text" name="address" placeholder="Filter by address..." onChange={handleStoreFilterChange} />
                </div>
                 <div className="table-container">
                     <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Overall Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store.id}>
                                    <td>{store.name}</td>
                                    <td>{store.email}</td>
                                    <td>{store.address}</td>
                                    <td>{store.overallRating}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
