import React, { useEffect, useState } from 'react'
import { useShopContext } from '../../context/ShopContext'
import { toast } from 'react-toastify'

const MyListings = () => {
  const { userProducts, deleteProduct } = useShopContext()
  
  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId)
      toast.success('Product deleted successfully')
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Listed Products</h2>
      {userProducts.length === 0 ? (
        <p>You haven't listed any products yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProducts.map((product) => (
            <div key={product._id} className="border rounded p-4">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2" />
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-600">${product.price}</p>
              <div className="mt-2 space-x-2">
                <button 
                  onClick={() => handleDelete(product._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyListings 