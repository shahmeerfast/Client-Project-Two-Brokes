import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useShopContext } from '../context/ShopContext'
import { FaShoppingBag, FaStore } from 'react-icons/fa'

const Home = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useShopContext()

  return (
    <div>
      {/* Hero Section */}
      <div className="relative">
        <div className="h-[500px] bg-gray-100">
          <img
            src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="hero"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to Our Store</h1>
            <p className="text-xl mb-8">Discover amazing products at great prices</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/collection')}
                className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-100"
              >
                <FaShoppingBag className="inline-block mr-2" />
                Start Shopping
              </button>
              <button
                onClick={() => navigate('/login?type=seller')}
                className="bg-transparent text-white px-8 py-3 rounded-full border-2 border-white hover:bg-white hover:text-black"
              >
                <FaStore className="inline-block mr-2" />
                Start Selling
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Section (for sellers only) */}
      {isAuthenticated && user?.role === 'seller' && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-12">
            <h2 className="text-2xl font-bold mb-4">Seller Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/add-product')}
                    className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                  >
                    Add New Product
                  </button>
                  <button
                    onClick={() => navigate('/seller/dashboard')}
                    className="w-full bg-white text-black px-4 py-2 rounded border border-black hover:bg-gray-100"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Recent Orders</h3>
                <p className="text-gray-600">No recent orders</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Statistics</h3>
                <div className="space-y-2">
                  <p>Total Products: 0</p>
                  <p>Total Sales: $0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative group cursor-pointer" onClick={() => navigate('/collection')}>
            <img
              src="https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Men's Fashion"
              className="w-full h-[300px] object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300 rounded-lg flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">Men's Fashion</h3>
            </div>
          </div>
          {/* Add other category cards here */}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Add your featured products here */}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-8">Get updates about new products and special offers</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Chat Button Section */}
     
    </div>
  )
}

export default Home
