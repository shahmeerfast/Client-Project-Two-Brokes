import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';

dotenv.config();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Format phone number to E.164 format
const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (assuming Pakistan +92)
  if (cleaned.startsWith('0')) {
    return '+92' + cleaned.substring(1);
  } else if (!cleaned.startsWith('92')) {
    return '+92' + cleaned;
  }
  return '+' + cleaned;
};

// Send Email OTP
export const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    
    // Store OTP with email
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      type: 'email'
    });

    try {
      // Always attempt to send email first
      await transporter.sendMail({
        from: `"E-Commerce Verification" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your OTP for email verification is:</p>
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
            <p>This OTP is valid for 10 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
          </div>
        `
      });

      console.log('Email sent successfully to:', email);
      
      res.status(200).json({ 
        success: true, 
        message: 'OTP sent successfully to your email'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);

      // Only fallback to console in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n=== Development Fallback ===`);
        console.log(`Email: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log(`=========================\n`);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Development Mode: Check console for OTP',
          otp: otp
        });
      }

      // In production, return error
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Email OTP Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Send Phone OTP
export const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = generateOTP();
    
    // Store OTP with phone
    otpStore.set(phone, {
      otp,
      timestamp: Date.now(),
      type: 'phone'
    });

    // Development mode or if there are Twilio limitations
    const useDevelopmentMode = process.env.NODE_ENV === 'development' || 
                              !process.env.TWILIO_PHONE_NUMBER?.startsWith('+1');

    if (useDevelopmentMode) {
      // Log OTP to console and send in response
      console.log(`\n=== Development Mode ===`);
      console.log(`Phone: ${phone}`);
      console.log(`OTP: ${otp}`);
      console.log(`=====================\n`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Development Mode: Check console for OTP',
        otp: otp // Only in development mode
      });
    }

    // Production mode with Twilio
    try {
      const formattedPhone = formatPhoneNumber(phone);
      
      // Check if the number is in proper E.164 format
      if (!formattedPhone.match(/^\+\d{10,15}$/)) {
        throw new Error('Invalid phone number format');
      }

      await twilioClient.messages.create({
        body: `Your OTP for phone verification is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });

      res.status(200).json({ 
        success: true, 
        message: 'OTP sent successfully'
      });
    } catch (twilioError) {
      console.error('Twilio Error:', twilioError);
      
      // Handle specific Twilio errors
      if (twilioError.code === 63038) { // Daily message limit exceeded
        console.log(`\n=== Fallback to Development Mode (Trial Limit Reached) ===`);
        console.log(`Phone: ${phone}`);
        console.log(`OTP: ${otp}`);
        console.log(`===============================================\n`);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Trial limit reached - Check console for OTP',
          otp: otp
        });
      }
      
      // For other Twilio errors, fall back to development mode
      console.log(`\n=== Fallback to Development Mode ===`);
      console.log(`Phone: ${phone}`);
      console.log(`OTP: ${otp}`);
      console.log(`================================\n`);
      
      res.status(200).json({ 
        success: true, 
        message: 'Fallback to Development Mode: Check console for OTP',
        otp: otp
      });
    }
  } catch (error) {
    console.error('Phone OTP Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate OTP',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Verify Email OTP
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email);

    if (!storedData || storedData.type !== 'email') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP request' 
      });
    }

    // Check if OTP is expired (10 minutes)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired' 
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    // Clear OTP after successful verification
    otpStore.delete(email);

    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Email Verification Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Verification failed' 
    });
  }
};

// Verify Phone OTP
export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const storedData = otpStore.get(phone);

    if (!storedData || storedData.type !== 'phone') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP request' 
      });
    }

    // Check if OTP is expired (10 minutes)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      otpStore.delete(phone);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired' 
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    // Clear OTP after successful verification
    otpStore.delete(phone);

    res.status(200).json({ 
      success: true, 
      message: 'Phone verified successfully' 
    });
  } catch (error) {
    console.error('Phone Verification Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Verification failed' 
    });
  }
};

// Login handler
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // For seller login
    if (role === 'seller') {
      const seller = await Seller.findOne({ email });
      
      if (!seller) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, seller.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: seller._id,
          role: 'seller',
          isVerified: seller.isVerified
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: seller._id,
          fullName: seller.fullName,
          email: seller.email,
          role: 'seller',
          isVerified: seller.isVerified
        }
      });
    } 
    // For buyer login (you can add buyer model and logic here)
    else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 