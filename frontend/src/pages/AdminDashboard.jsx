import React from 'react';
import { useProduct } from '../context/ProductContext';

const AdminDashboard = () => {
  const { pendingProducts, approveProduct, rejectProduct } = useProduct();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Product Approval Dashboard</h2>
      <div className="grid gap-6">
        {pendingProducts.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="font-bold">{product.title}</h3>
            <p>Category: {product.category}</p>
            <p>Condition: {product.condition}</p>
            <p>Price: ${product.price}</p>
            <div className="mt-4 space-x-4">
              <button 
                onClick={() => approveProduct(product.id)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Approve
              </button>
              <button 
                onClick={() => rejectProduct(product.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard; 