import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [filterCondition, setFilterCondition] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      const response = await axios.get('/api/product/admin/pending', {
        headers: { token: localStorage.getItem('token') }
      });
      setPendingProducts(response.data.products);
      
      // Calculate statistics
      const stats = response.data.products.reduce((acc, product) => {
        acc.total++;
        acc[product.approvalStatus]++;
        return acc;
      }, { total: 0, pending: 0, approved: 0, rejected: 0 });
      
      setStats(stats);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching pending products');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (productId, status) => {
    try {
      const data = {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined
      };

      await axios.put(`/api/product/admin/product/${productId}/status`, data, {
        headers: { token: localStorage.getItem('token') }
      });

      toast.success(`Product ${status} successfully`);
      fetchPendingProducts();
      setSelectedProduct(null);
      setRejectionReason('');
      setSelectedProducts(new Set());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating product status');
    }
  };

  const handleBulkAction = async (status) => {
    try {
      const promises = Array.from(selectedProducts).map(productId =>
        axios.put(`/api/product/admin/product/${productId}/status`,
          {
            status,
            rejectionReason: status === 'rejected' ? rejectionReason : undefined
          },
          {
            headers: { token: localStorage.getItem('token') }
          }
        )
      );

      await Promise.all(promises);
      toast.success(`${selectedProducts.size} products ${status} successfully`);
      fetchPendingProducts();
      setSelectedProducts(new Set());
      setRejectionReason('');
    } catch (error) {
      toast.error('Error performing bulk action');
    }
  };

  const toggleProductSelection = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const filteredProducts = pendingProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondition = filterCondition === 'all' || product.condition === filterCondition;
      return matchesSearch && matchesCondition;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'priceLow') return a.price - b.price;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Product Approval</h1>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-gray-500 capitalize">{key}</h3>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />
        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="all">All Conditions</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priceHigh">Price High to Low</option>
          <option value="priceLow">Price Low to High</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6 flex items-center gap-4">
          <span className="text-sm">{selectedProducts.size} products selected</span>
          <button
            onClick={() => handleBulkAction('approved')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Approve Selected
          </button>
          <button
            onClick={() => handleBulkAction('rejected')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reject Selected
          </button>
          <button
            onClick={() => setSelectedProducts(new Set())}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear Selection
          </button>
        </div>
      )}
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No pending products to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product._id)}
                  onChange={() => toggleProductSelection(product._id)}
                  className="h-5 w-5 rounded border-gray-300"
                />
                <div className="aspect-w-16 aspect-h-9 flex-1">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="object-cover rounded-lg w-full h-48"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-lg font-bold mb-2">${product.price}</p>
              <p className="text-sm text-gray-500 mb-2">
                Condition: {product.condition}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Seller: {product.seller.fullName}
              </p>

              {selectedProduct === product._id ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Reason for rejection (optional)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproval(product._id, 'approved')}
                      className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(product._id, 'rejected')}
                      className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setRejectionReason('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedProduct(product._id)}
                  className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
                >
                  Review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 