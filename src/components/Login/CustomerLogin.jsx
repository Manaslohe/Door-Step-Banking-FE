import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Key, 
  ArrowLeft, 
  LogIn, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { auth } from '../../utils/auth';

const CustomerLogin = ({ onClose }) => {
  const navigate = useNavigate();
  const [panNumber, setPanNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [phoneLastDigits, setPhoneLastDigits] = useState('');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const isPanValid = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return pan.length === 10 && panRegex.test(pan);
  };

  const handlePanChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 10) { // Only allow up to 10 characters
      setPanNumber(value);
    }
  };

  const handlePanSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.verifyPAN(panNumber.toUpperCase());
      
      if (response.success) {
        setPhoneLastDigits(response.phone);
        setShowOtpField(true);
        localStorage.setItem('tempVerification', JSON.stringify(response));
        setError('');
      } else {
        throw new Error(response.message || 'No account found with this PAN number');
      }
    } catch (error) {
      console.error('PAN verification error:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to verify PAN. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const tempData = localStorage.getItem('tempVerification');
      if (!tempData) {
        throw new Error('Verification data not found');
      }
      
      const verificationData = JSON.parse(tempData);
      const otpValue = otp.join('');
      
      if (otpValue === '000000') {
        const loginPayload = {
          email: verificationData.user.email,
          password: verificationData.user.phone,
          pan: panNumber.toUpperCase()
        };
        
        const loginResponse = await api.post('/users/login', loginPayload);
        
        if (loginResponse.data.success) {
          const { token, user } = loginResponse.data.data;
          const authSet = auth.setAuth(token, user);
          
          if (!authSet || !auth.isSessionValid()) {
            throw new Error('Authentication failed');
          }

          setSuccess(true);
          setShowSuccessOverlay(true);
          localStorage.removeItem('tempVerification');

          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
        }
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const renderOtpSection = () => (
    <div className="space-y-2">
      <label className="text-lg font-medium text-gray-700">Verification Code</label>
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-4">
        <div className="flex items-center text-sm text-blue-600">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
          </motion.span>
          <span>OTP sent to ******{phoneLastDigits}</span>
        </div>
      </div>
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            name={`otp-${index}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            maxLength={1}
            className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 
              ${success ? 'border-green-500 text-green-600 bg-green-50' : 
              'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'}
              transition-all duration-300 bg-white/50 backdrop-blur-sm`}
            autoFocus={index === 0}
            disabled={success}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">Use 000000 for testing purposes</p>
    </div>
  );

  return (
    <div className="p-10 relative">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-3 rounded-full bg-blue-50 mb-4"
        >
          <UserCheck className="w-12 h-12 text-blue-600" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
        <p className="text-gray-600 mt-2">Access your secure banking services</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </motion.div>
      )}

      <form onSubmit={showOtpField ? handleOtpSubmit : handlePanSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {!showOtpField ? (
            <div className="space-y-2">
              <label className="text-lg font-medium text-gray-700">PAN Number</label>
              <div className="relative group">
                <Key className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                <input
                  type="text"
                  value={panNumber}
                  onChange={handlePanChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 
                    focus:ring-4 focus:ring-blue-100 
                    text-lg transition-all duration-300 bg-white/50 backdrop-blur-sm
                    placeholder-gray-400 group-hover:border-gray-300
                    ${panNumber.length === 10 
                      ? isPanValid(panNumber)
                        ? 'border-green-200 focus:border-green-500'
                        : 'border-red-200 focus:border-red-500'
                      : 'border-gray-100 focus:border-blue-500'
                    }`}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  required
                />
              </div>
              <div className="flex justify-between items-center ml-1">
                <p className="text-sm text-gray-500">Enter your PAN number to receive OTP</p>
                <span className={`text-sm ${panNumber.length === 10 
                  ? isPanValid(panNumber) 
                    ? 'text-green-600' 
                    : 'text-red-600'
                  : 'text-gray-400'
                }`}>
                  {panNumber.length}/10
                </span>
              </div>
            </div>
          ) : (
            renderOtpSection()
          )}
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading || success || (showOtpField ? otp.join('').length !== 6 : !isPanValid(panNumber))}
          whileHover={{ scale: loading || success ? 1 : 1.01 }}
          whileTap={{ scale: loading || success ? 1 : 0.99 }}
          className={`w-full py-4 rounded-xl transition-all duration-300 
            flex items-center justify-center space-x-2 text-lg font-medium
            ${loading || success 
              ? success 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 cursor-not-allowed text-gray-400' 
              : !isPanValid(panNumber) && !showOtpField
                ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
            }`}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : success ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 360] }}
              transition={{ type: "spring", duration: 0.7 }}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Success!</span>
            </motion.div>
          ) : (
            <>
              <LogIn className="w-6 h-6" />
              <span>{showOtpField ? 'Verify OTP' : 'Get OTP'}</span>
            </>
          )}
        </motion.button>
      </form>

      {showSuccessOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, type: "spring" }}
            className="bg-green-50 rounded-full p-6 mb-4"
          >
            <CheckCircle className="w-16 h-16 text-green-500" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Login Successful!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Redirecting to your dashboard...
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="h-1 bg-green-500 mt-4 rounded-full"
          />
        </motion.div>
      )}
    </div>
  );
};

export default CustomerLogin;