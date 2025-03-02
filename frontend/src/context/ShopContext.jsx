import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext({
    products: [],
    currency: '$',
    delivery_fee: 10,
    search: '',
    showSearch: false,
    cartItems: {},
    getCartCount: () => 0,
    getCartAmount: () => 0,
    navigate: () => {},
    backendUrl: '',
    setToken: () => {},
    token: '',
    userProducts: [],
    addProduct: () => {},
    updateProduct: () => {},
    deleteProduct: () => {},
    user: null,
    login: () => {},
    isAuthenticated: false,
    isSeller: false,
});

export const useShopContext = () => useContext(ShopContext)

export const ShopContextProvider = ({ children }) => {
    // Auth state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    
    // Shop state
    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [userProducts, setUserProducts] = useState([]);
    
    const [orders, setOrders] = useState([
        {
            _id: 1,
            items: [
                {
                    _id: 1,
                    name: 'Test Product',
                    quantity: 2,
                    price: 99.99,
                    image: 'https://via.placeholder.com/150'
                }
            ],
            total: 199.98,
            status: 'Delivered',
            createdAt: new Date().toISOString()
        }
    ]);

    // Auth functions
    const login = async (formData) => {
        setLoading(true);
        try {
            console.log('Attempting login with:', formData);
            const response = await axios.post('http://localhost:4000/api/auth/login', formData);
            console.log('Login response:', response.data);
            
            if (response.data.success) {
                const userData = response.data.user;
                const token = response.data.token;

                console.log('Login successful, user data:', userData);

                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', token);
                
                // Update state
                setUser(userData);
                setToken(token);

                console.log('State and localStorage updated');

                // Force navigation using window.location.href
                if (userData.role === 'seller') {
                    console.log('Navigating to seller dashboard');
                    window.location.href = '/seller/dashboard';
                } else {
                    console.log('Navigating to home');
                    window.location.href = '/';
                }

                return { success: true, user: userData };
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setToken('');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // Cart functions
    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } });
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    };

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);

        cartData[itemId][size] = quantity;

        setCartItems(cartData)

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } })
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalAmount;
    }

    // Product functions
    const addProduct = async (productData) => {
        try {
            const newProduct = {
                _id: Date.now().toString(),
                ...productData,
                createdAt: new Date().toISOString()
            };
            
            // Store products in localStorage to persist data
            const updatedProducts = [...userProducts, newProduct];
            setUserProducts(updatedProducts);
            localStorage.setItem('userProducts', JSON.stringify(updatedProducts));
            
            return newProduct;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    };

    const deleteProduct = async (productId) => {
        try {
            setUserProducts(prev => prev.filter(product => product._id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    };

    // API functions
    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products.reverse())
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getUserCart = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } })
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Load user data on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }, []);

    // Load products from localStorage on mount
    useEffect(() => {
        const storedProducts = localStorage.getItem('userProducts');
        if (storedProducts) {
            try {
                setUserProducts(JSON.parse(storedProducts));
            } catch (error) {
                console.error('Error parsing stored products:', error);
                localStorage.removeItem('userProducts');
            }
        }
    }, []);

    const contextValue = {
        // Auth
        user,
        login,
        logout: handleLogout,
        loading,
        isAuthenticated: !!user,
        isSeller: user?.role === 'seller',
        token,
        setToken,

        // Shop
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        addToCart,
        setCartItems,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate,
        backendUrl,
        userProducts,
        setUserProducts,
        orders,
        setOrders,
        addProduct,
        deleteProduct
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
