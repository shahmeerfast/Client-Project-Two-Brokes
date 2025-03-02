import express from 'express';
import { sendEmailOTP, verifyEmailOTP, sendPhoneOTP, verifyPhoneOTP, login } from '../controllers/authController.js';

const router = express.Router();

// OTP routes
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/send-phone-otp', sendPhoneOTP);
router.post('/verify-phone-otp', verifyPhoneOTP);

// Auth routes
router.post('/login', login);

export default router; 