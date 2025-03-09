import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from '../config/axios';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useShopContext();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: location.search.includes('type=seller') ? 'seller' : 'admin'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = () => {
        if (formData.role === 'admin') {
            navigate('/admin/register');
        } else {
            navigate('/seller/register');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await login(formData);
            if (result.success) {
                toast.success('Login successful!');
                if (formData.role === 'seller') {
                    navigate('/seller/dashboard');
                } else if (formData.role === 'admin') {
                    navigate('/admin/dashboard');
                }
            }
        } catch (error) {
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {formData.role === 'seller' ? 'Seller Login' : 'Admin Login'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <button
                            onClick={handleRegister}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            {formData.role === 'seller' 
                                ? 'register as a seller'
                                : 'register as first admin'}
                        </button>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Login as:</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        >
                            <option value="admin">Admin</option>
                            <option value="seller">Seller</option>
                        </select>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Sign in
                        </button>
                    </div>

                    {formData.role === 'seller' && (
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
