import React, { useState, useRef, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const OTPVerificationModal = ({ onClose, onVerify }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  // Focus the first input when modal opens
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted content is numeric and has 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };

  const verifyOtp = () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setVerifying(true);
    
    // Simulate API verification with a timeout
    setTimeout(() => {
      if (otpString === '000000') {
        setVerified(true);
        
        // Wait to show success state before closing
        setTimeout(() => {
          onVerify();
        }, 1000);
      } else {
        setError('Invalid OTP. Please try again.');
        setVerifying(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Verify OTP</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close dialog"
            disabled={verifying}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            
            {verified ? (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-2">OTP Verified!</h3>
                <p className="text-gray-600 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 inline mr-2" />
                  Verification successful, redirecting...
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Enter Verification Code</h3>
                <p className="text-gray-600">
                  We've sent a 6-digit OTP to the service provider for this request.
                  Please contact them if you haven't received it.
                </p>
              </>
            )}
          </div>

          {!verified && (
            <>
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : null}
                    className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm"
                    disabled={verifying}
                  />
                ))}
              </div>

              {error && (
                <div className="mb-6 text-center text-red-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                  disabled={verifying}
                >
                  Cancel
                </button>
                <button 
                  onClick={verifyOtp}
                  className={`flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center ${
                    verifying ? 'opacity-75' : 'hover:bg-blue-700'
                  }`}
                  disabled={verifying}
                >
                  {verifying ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerificationModal;
