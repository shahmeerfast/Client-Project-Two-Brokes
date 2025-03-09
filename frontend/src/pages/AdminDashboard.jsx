import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { useShopContext } from '../context/ShopContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, token } = useShopContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [imageError, setImageError] = useState({});

    // Check if user is admin
    useEffect(() => {
        if (!token || !user || user.role !== 'admin') {
            toast.error('Access denied. Admin only area.');
            navigate('/login');
        }
    }, [token, user, navigate]);

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, [filter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/product/admin/${filter}`, {
                headers: { token: localStorage.getItem('token') }
            });
            
            setProducts(response.data.products);
            
            // Calculate statistics
            const stats = response.data.products.reduce((acc, product) => {
                acc.total++;
                acc[product.approvalStatus]++;
                return acc;
            }, { total: 0, pending: 0, approved: 0, rejected: 0 });
            
            setStats(stats);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveProduct = async (productId) => {
        try {
            await axios.put(`/api/product/admin/product/${productId}/status`, 
                { status: 'approved' },
                { headers: { token: localStorage.getItem('token') }}
            );
            toast.success('Product approved successfully');
            fetchProducts();
        } catch (error) {
            console.error('Error approving product:', error);
            toast.error('Failed to approve product');
        }
    };

    const handleRejectProduct = async (productId, reason) => {
        try {
            await axios.put(`/api/product/admin/product/${productId}/status`,
                { 
                    status: 'rejected',
                    rejectionReason: reason
                },
                { headers: { token: localStorage.getItem('token') }}
            );
            toast.success('Product rejected successfully');
            fetchProducts();
        } catch (error) {
            console.error('Error rejecting product:', error);
            toast.error('Failed to reject product');
        }
    };

    const handleImageError = (productId) => {
        setImageError(prev => ({
            ...prev,
            [productId]: true
        }));
    };

    const getImageUrl = (product) => {
        if (!product.images || !product.images.length || imageError[product._id]) {
            return 'https://via.placeholder.com/300x200?text=No+Image';
        }
        
        const imageUrl = product.images[0];
        if (!imageUrl || imageUrl.startsWith('data:;base64,') || !imageUrl.startsWith('http')) {
            return 'https://via.placeholder.com/300x200?text=Invalid+Image';
        }
        
        return imageUrl;
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-gray-500 capitalize">{key}</h3>
                        <p className="text-2xl font-bold">{value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 border rounded-lg"
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All Products</option>
                </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="border rounded-lg p-4 shadow-sm">
                            <div className="aspect-w-16 aspect-h-9 mb-4">
                                <img
                                    src={getImageUrl(product)}
                                    alt={product.name}
                                    className="object-cover rounded-lg w-full h-48"
                                    onError={() => handleImageError(product._id)}
                                />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                            <p className="text-gray-600 mb-2">{product.description}</p>
                            <p className="text-lg font-bold mb-2">${product.price}</p>
                            
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500">
                                    Category: {product.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    product.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    product.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {product.approvalStatus}
                                </span>
                            </div>

                            {product.approvalStatus === 'pending' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleApproveProduct(product._id)}
                                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = window.prompt('Enter rejection reason:');
                                            if (reason) handleRejectProduct(product._id, reason);
                                        }}
                                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {product.approvalStatus === 'rejected' && product.rejectionReason && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <span className="font-semibold">Rejection Reason:</span>{' '}
                                        {product.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard; 