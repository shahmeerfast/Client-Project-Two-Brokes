import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import Profile from './pages/Profile'
import AddProduct from './pages/AddProduct'
import SellerDashboard from './pages/SellerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Messages from './pages/Messages'
import SellerRegister from './pages/SellerRegister'

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/seller/register' element={<SellerRegister />} />
        <Route 
          path='/cart' 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route path='/login' element={<Login />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/profile' element={<Profile />} />
        <Route 
          path='/add-product' 
          element={
            <ProtectedRoute requireSeller={true}>
              <AddProduct />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/seller/dashboard' 
          element={
            <ProtectedRoute requireSeller={true}>
              <SellerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/admin/dashboard' 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/messages' 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
