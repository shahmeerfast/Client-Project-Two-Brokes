import React, { useState, useEffect } from 'react'
import { useShopContext } from '../context/ShopContext'
import MyProducts from '../components/profile/MyProducts'
import MyOrders from '../components/profile/MyOrders'
import MyListings from '../components/profile/MyListings'
import { Navigate } from 'react-router-dom'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('orders')
  const { user, userProducts, orders } = useShopContext()

  useEffect(() => {
    console.log("Profile mounted", { user, userProducts, orders })
  }, [user, userProducts, orders])

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">{user.email}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 mb-6 border-b pb-4">
          <button 
            className={`px-6 py-2 rounded-lg font-medium transition-colors
              ${activeTab === 'orders' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders ({orders?.length || 0})
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-medium transition-colors
              ${activeTab === 'listings' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('listings')}
          >
            My Listings ({userProducts?.length || 0})
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-medium transition-colors
              ${activeTab === 'products' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setActiveTab('products')}
          >
            Add New Product
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'orders' && <MyOrders />}
          {activeTab === 'listings' && <MyListings />}
          {activeTab === 'products' && <MyProducts />}
        </div>
      </div>
    </div>
  )
}

export default Profile 