import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../config/axios';

const SellerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    country: '',
    state: '',
    streetAddress: '',
    zipCode: '',
    governmentId: null,
    passport: null,
    selfie: null,
    businessRegNumber: '',
    bankDetails: '',
    agreeToTerms: false
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const sendEmailOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/send-email-otp', { 
        email: formData.email 
      });
      
      setShowEmailOtpInput(true);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/verify-email-otp', { 
        email: formData.email,
        otp: emailOtp 
      });
      
      setEmailVerified(true);
      setShowEmailOtpInput(false);
      toast.success('Email verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/send-phone-otp', { phone: formData.phone });
      setShowPhoneOtpInput(true);
      toast.success('OTP sent successfully! Check console for OTP (development only)');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/verify-phone-otp', { 
        phone: formData.phone,
        otp: phoneOtp 
      });
      setPhoneVerified(true);
      setShowPhoneOtpInput(false);
      toast.success('Phone verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailVerified || !phoneVerified) {
      toast.error('Please verify both email and phone number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await axios.post('/api/seller/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Registration successful! Please login to continue.');
        
        // Clear any stored data
        localStorage.clear();
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login?type=seller');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Seller Registration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleInputChange}
                className="input-field"
                required
                min="18"
              />
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field ${emailVerified ? 'input-success' : ''}`}
                    required
                    disabled={emailVerified}
                  />
                  <button
                    type="button"
                    onClick={sendEmailOTP}
                    disabled={emailVerified || loading || !formData.email}
                    className="btn-secondary whitespace-nowrap"
                  >
                    {emailVerified ? 'Verified ✓' : 'Send OTP'}
                  </button>
                </div>
                {showEmailOtpInput && !emailVerified && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Email OTP"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      className="input-field"
                    />
                    <button
                      type="button"
                      onClick={verifyEmailOTP}
                      disabled={loading || !emailOtp}
                      className="btn-secondary"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`input-field ${phoneVerified ? 'input-success' : ''}`}
                    required
                    disabled={phoneVerified}
                  />
                  <button
                    type="button"
                    onClick={sendPhoneOTP}
                    disabled={phoneVerified || loading || !formData.phone}
                    className="btn-secondary whitespace-nowrap"
                  >
                    {phoneVerified ? 'Verified ✓' : 'Send OTP'}
                  </button>
                </div>
                {showPhoneOtpInput && !phoneVerified && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Phone OTP"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      className="input-field"
                    />
                    <button
                      type="button"
                      onClick={verifyPhoneOTP}
                      disabled={loading || !phoneOtp}
                      className="btn-secondary"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Login Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State/City"
                value={formData.state}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="streetAddress"
                placeholder="Street Address"
                value={formData.streetAddress}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              <input
                type="text"
                name="zipCode"
                placeholder="ZIP/Postal Code (optional)"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Identity Verification */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Identity Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Government ID (NIN)</label>
                <input
                  type="file"
                  name="governmentId"
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  accept="image/*,.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Passport</label>
                <input
                  type="file"
                  name="passport"
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  accept="image/*,.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Selfie</label>
                <input
                  type="file"
                  name="selfie"
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  accept="image/*"
                />
              </div>
              <input
                type="text"
                name="businessRegNumber"
                placeholder="Business Registration Number"
                value={formData.businessRegNumber}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Bank Account Details</h3>
            <textarea
              name="bankDetails"
              placeholder="Enter your bank account details"
              value={formData.bankDetails}
              onChange={handleInputChange}
              className="input-field h-24"
              required
            />
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4"
                required
              />
              <label className="text-sm">
                I agree to the Terms & Conditions and Privacy Policy
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !emailVerified || !phoneVerified || !formData.agreeToTerms}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Register as Seller'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerRegister; 