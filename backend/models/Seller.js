import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 18
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  streetAddress: {
    type: String,
    required: true
  },
  zipCode: String,
  governmentId: {
    type: String,
    required: true
  },
  passport: {
    type: String,
    required: true
  },
  selfie: {
    type: String,
    required: true
  },
  businessRegNumber: {
    type: String,
    required: true
  },
  bankDetails: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Seller', sellerSchema); 