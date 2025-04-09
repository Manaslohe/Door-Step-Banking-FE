import React, { useState, useRef, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const OTPVerificationModal = ({ onClose, onVerify, phoneNumber }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef([]);

  // Focus the first input when modal opens
  useEffect(() => {
    if (otpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpSent]);

  // Format phone number for display if provided
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    const last10Digits = digits.slice(-10);
    return last10Digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  // Simulated OTP sending
  const sendOtp = async () => {
    setSendingOtp(true);
    setError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOtpSent(true);
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Auto-send OTP if no phone number is provided (service flow)
  useEffect(() => {
    if (!phoneNumber) {
      setOtpSent(true);
    }
  }, [phoneNumber]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // Handle pasting multiple digits
    if (value.length > 1) {
      // If it's a valid number sequence
      if (/^\d+$/.test(value) && value.length <= 6) {
        const digits = value.split('').slice(0, 6);
        const newOtp = [...otp];
        
        // Fill available slots with pasted digits
        digits.forEach((digit, idx) => {
          if (idx < 6) {
            newOtp[idx] = digit;
          }
        });
        
        setOtp(newOtp);
        setError('');
        
        // If all 6 digits were pasted, focus the last input
        if (digits.length === 6) {
          inputRefs.current[5].focus();
          // Auto-verify after a short delay
          setTimeout(() => verifyOtp(), 300);
        } else {
          // Focus the next empty input
          const nextIndex = Math.min(digits.length, 5);
          inputRefs.current[nextIndex].focus();
        }
        
        return;
      }
      
      // Not a valid paste, just use the first digit if it's a number
      const firstChar = value.charAt(0);
      if (/^\d$/.test(firstChar)) {
        const newOtp = [...otp];
        newOtp[index] = firstChar;
        setOtp(newOtp);
        setError('');
        
        // Auto focus next input
        if (index < 5) {
          inputRefs.current[index + 1].focus();
        }
      }
      
      return;
    }

    // Handle single digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Auto verify if all slots are filled
    if (value && index === 5) {
      if (!newOtp.includes('')) {
        setTimeout(() => verifyOtp(), 300);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      // If current input has a value, clear it
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        return;
      }
      
      // If current input is empty and not the first one, go to previous input
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    } 
    // Handle arrow navigation
    else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    } 
    else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted content is numeric
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('').slice(0, 6);
      const newOtp = [...otp];
      
      // Fill as many digits as we have
      digits.forEach((digit, idx) => {
        if (idx < 6) {
          newOtp[idx] = digit;
        }
      });
      
      setOtp(newOtp);
      setError('');
      
      // Focus appropriate input based on paste length
      if (digits.length >= 6) {
        inputRefs.current[5].focus();
        // Auto-verify if all slots filled
        setTimeout(() => verifyOtp(), 300);
      } else {
        inputRefs.current[Math.min(digits.length, 5)].focus();
      }
    }
  };

  const verifyOtp = () => {
    const otpString = otp.join('');
    
    // Check if any digit is missing
    if (otp.some(digit => digit === '')) {
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
            {verified ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">OTP Verified!</h3>
                <p className="text-gray-600 mb-4">
                  Verification successful, proceeding...
                </p>
              </>
            ) : phoneNumber ? (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Verify Your Phone</h3>
                <p className="text-gray-600">
                  {otpSent 
                    ? `Enter the 6-digit code sent to ${formatPhoneNumber(phoneNumber)}`
                    : `We'll send a verification code to ${formatPhoneNumber(phoneNumber)}`
                  }
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Service Verification Required</h3>
                <p className="text-gray-600">
                  Please enter the 6-digit verification code provided by the service provider.
                </p>
              </>
            )}
          </div>

          {!verified && (
            <>
              {phoneNumber && !otpSent ? (
                <button
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  className="w-full mb-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center"
                >
                  {sendingOtp ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              ) : (
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
                      disabled={verifying || verified}
                    />
                  ))}
                </div>
              )}

              {error && (
                <div className="mb-6 text-center text-red-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              {otpSent && phoneNumber && (
                <div className="text-center mb-6">
                  <button
                    onClick={sendOtp}
                    disabled={sendingOtp}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {sendingOtp ? 'Sending...' : 'Resend Verification Code'}
                  </button>
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
                {otpSent || !phoneNumber ? (
                  <button 
                    onClick={verifyOtp}
                    className={`flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center ${
                      verifying ? 'opacity-75' : 'hover:bg-blue-700'
                    }`}
                    disabled={verifying || otp.some(d => d === '')}
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
                ) : null}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerificationModal;
