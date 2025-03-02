import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const ManageUsers = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/user/users`, {
                headers: { token },
            });
            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch users');
        }
    };

    // Add a new user
    const addUser = async () => {
        try {
            const response = await axios.post(`${backendUrl}/api/user/add`, newUser, {
                headers: { token },
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setNewUser({ name: '', email: '', password: '' });
                fetchUsers();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to add user');
        }
    };

    // Delete a user
    const deleteUser = async (email) => {
        try {
            console.log('Deleting user with email:', email); // Log for debugging
            const response = await axios.post(`${backendUrl}/api/user/delete`, { email }, {
                headers: { token },
            });
            console.log('Delete User Response:', response); // Log the server response
            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error.response?.data || error.message);
            toast.error('Failed to delete user');
        }
    };
    
    

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <h1>Manage Users</h1>

            {/* Add User Form */}
            <div className="add-user-form">
                <h3>Add New User</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <button onClick={addUser}>Add User</button>
            </div>

           {/* Users List */}
<div className="user-list">
    <h3>Registered Users</h3>
    {users.map((user) => (
        <div key={user._id} className="user-item">
            <p>{user.name} ({user.email})</p>
            <button onClick={() => deleteUser(user.email)}>Delete</button>
        </div>
    ))}
</div>

        </div>
    );
};

export default ManageUsers;
