import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopContext } from '../context/ShopContext';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { userProducts } = useShopContext();

    useEffect(() => {
        console.log('Current products:', userProducts); // Debug log
    }, [userProducts]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                <button
                    onClick={() => navigate('/add-product')}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Add New Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProducts.map((product) => {
                    console.log('Product image:', product.image ? 'Present' : 'Missing', product); // Debug log
                    return (
                        <div key={product._id} className="border rounded-lg p-4 shadow-sm">
                            <div className="aspect-w-16 aspect-h-9 mb-4">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-md"
                                        onError={(e) => {
                                            console.error('Image failed to load:', e);
                                            e.target.src = 'https://via.placeholder.com/150';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md">
                                        <span className="text-gray-400">No image</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-gray-600">${product.price}</p>
                            <p className="text-sm text-gray-500 mt-2">{product.description}</p>
                            <div className="mt-4 text-sm text-gray-500">
                                Category: {product.category}
                            </div>
                        </div>
                    );
                })}
            </div>

            {userProducts.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    No products added yet. Click "Add New Product" to get started.
                </div>
            )}
        </div>
    );
};

export default SellerDashboard; 