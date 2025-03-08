import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, verifyRazorpay} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import { isAuthenticated } from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)

// Payment Features
orderRouter.post('/place', isAuthenticated, placeOrder)
orderRouter.post('/stripe', isAuthenticated, placeOrderStripe)
orderRouter.post('/razorpay', isAuthenticated, placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders', isAuthenticated, userOrders)

// verify payment
orderRouter.post('/verifyStripe', isAuthenticated, verifyStripe)
orderRouter.post('/verifyRazorpay', isAuthenticated, verifyRazorpay)

export default orderRouter