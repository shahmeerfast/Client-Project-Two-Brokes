import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';

export const register = async (req, res) => {
  try {
    const {
      fullName,
      age,
      email,
      phone,
      username,
      password,
      country,
      state,
      streetAddress,
      zipCode,
      businessRegNumber,
      bankDetails,
    } = req.body;

    // Check if email or username already exists
    const existingUser = await Seller.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get file paths
    const governmentIdPath = req.files?.governmentId?.[0]?.path;
    const passportPath = req.files?.passport?.[0]?.path;
    const selfiePath = req.files?.selfie?.[0]?.path;

    // Create new seller
    const seller = new Seller({
      fullName,
      age,
      email,
      phone,
      username,
      password: hashedPassword,
      country,
      state,
      streetAddress,
      zipCode,
      governmentId: governmentIdPath,
      passport: passportPath,
      selfie: selfiePath,
      businessRegNumber,
      bankDetails,
      isVerified: false // Admin needs to verify the seller
    });

    await seller.save();

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

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please wait for admin verification.',
      token,
      user: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        username: seller.username,
        role: 'seller',
        isVerified: seller.isVerified
      }
    });
  } catch (error) {
    console.error('Seller Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 