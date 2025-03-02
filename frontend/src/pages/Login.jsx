import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useShopContext();
  const [isSeller, setIsSeller] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer'
  });

  // Set initial role based on URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'seller') {
      setIsSeller(true);
      setFormData(prev => ({ ...prev, role: 'seller' }));
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        role: isSeller ? 'seller' : 'buyer'
      };

      console.log('Submitting login data:', dataToSubmit);
      const result = await login(dataToSubmit);
      console.log('Login result:', result);

      if (result.success) {
        toast.success('Login successful!');
        // Navigation is handled in ShopContext
      }
    } catch (error) {
      console.error('Login error in component:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };

  const handleRoleChange = (newIsSeller) => {
    setIsSeller(newIsSeller);
    setFormData(prev => ({
      ...prev,
      role: newIsSeller ? 'seller' : 'buyer'
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isSeller ? 'Seller Login' : 'Buyer Login'}
      </h2>
      
      <div className="mb-4 flex justify-center">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleRoleChange(false)}
            className={`px-4 py-2 rounded ${
              !isSeller ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange(true)}
            className={`px-4 py-2 rounded ${
              isSeller ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            Seller
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-black hover:bg-gray-800'
          } text-white transition-colors duration-200`}
        >
          {loading ? 'Logging in...' : (isSeller ? 'Login as Seller' : 'Login')}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate(isSeller ? '/seller/register' : '/register')}
            className="text-blue-600 hover:underline"
          >
            Register here
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
