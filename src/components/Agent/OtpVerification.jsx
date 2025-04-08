import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Fixed test OTP for development
const TEST_OTP = '000000';

const OtpVerification = ({ phoneNumber, onVerificationSuccess, onClose }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Create refs for OTP inputs
  const inputRefs = Array(6).fill(0).map(() => useRef(null));
  const [activeInput, setActiveInput] = useState(0);

  // Focus first input when OTP is sent
  useEffect(() => {
    if (otpSent && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [otpSent]);

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    const last10Digits = digits.slice(-10);
    return last10Digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  // Simulated OTP sending - simplified
  const sendOtp = async () => {
    if (!phoneNumber) {
      setOtpError('No phone number provided.');
      return;
    }

    setSendingOtp(true);
    setOtpError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Just set OTP as sent - no logging or focusing
      setOtpSent(true);
    } catch (error) {
      setOtpError('Failed to send verification code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Simulated OTP verification - simplified
  const verifyOtp = async () => {
    if (otpValue.some((digit) => digit === '')) {
      setOtpError('Please enter complete OTP');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');

    try {
      const otpCode = otpValue.join('');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Verify against test OTP
      if (otpCode === TEST_OTP) {
        setIsVerified(true);
        setTimeout(() => {
          onVerificationSuccess();
        }, 1000);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      setOtpError('Invalid OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Improved OTP input handling
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    
    // Allow for pasting entire OTP
    if (value.length > 1) {
      // Handle paste of full OTP
      if (/^\d+$/.test(value) && value.length <= 6) {
        const digits = value.split('').slice(0, 6);
        const newOtpValue = [...otpValue];
        
        // Fill as many digits as we have
        digits.forEach((digit, idx) => {
          if (idx < 6) {
            newOtpValue[idx] = digit;
          }
        });
        
        setOtpValue(newOtpValue);
        
        // If we have all 6 digits, verify automatically
        if (digits.length === 6) {
          setTimeout(() => verifyOtp(), 300);
        } else {
          // Focus the next empty input
          const nextIndex = Math.min(digits.length, 5);
          inputRefs[nextIndex].current.focus();
          setActiveInput(nextIndex);
        }
        
        return;
      }
      
      // Not a valid paste, just take the first digit if it's a number
      const firstChar = value.charAt(0);
      if (/^\d$/.test(firstChar)) {
        handleSingleDigitInput(firstChar, index);
      }
      return;
    }
    
    // Handle single digit input
    if (/^\d*$/.test(value)) {
      handleSingleDigitInput(value, index);
    }
  };
  
  const handleSingleDigitInput = (value, index) => {
    const newOtpValue = [...otpValue];
    newOtpValue[index] = value;
    setOtpValue(newOtpValue);
    
    // If input is not empty and not the last one, move to next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
      setActiveInput(index + 1);
    }
    
    // Auto verify if all digits are entered
    if (value && index === 5) {
      const completeOtp = newOtpValue.join('');
      if (completeOtp.length === 6 && !newOtpValue.includes('')) {
        setTimeout(() => verifyOtp(), 300);
      }
    }
  };
  
  // Handle key navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtpValue = [...otpValue];
      
      // If current input has a value, clear it
      if (newOtpValue[index]) {
        newOtpValue[index] = '';
        setOtpValue(newOtpValue);
        return;
      }
      
      // If current input is empty and not the first one, go to previous input
      if (!newOtpValue[index] && index > 0) {
        newOtpValue[index - 1] = '';
        setOtpValue(newOtpValue);
        inputRefs[index - 1].current.focus();
        setActiveInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs[index - 1].current.focus();
      setActiveInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs[index + 1].current.focus();
      setActiveInput(index + 1);
    }
  };
  
  // Handle input focus
  const handleFocus = (index) => {
    setActiveInput(index);
  };

  if (isVerified) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl text-center">
          <div className="text-4xl text-green-600 mb-4">✓</div>
          <h3 className="text-xl font-bold text-gray-900">Verification Successful</h3>
          <p className="text-gray-600 mt-2">Phone number verified successfully!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Verify Phone Number</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          {otpSent ? 'Enter the code sent to' : 'We will send a code to'}{' '}
          <span className="font-medium">{formatPhoneNumber(phoneNumber)}</span>
        </p>

        {/* Small hint for testing */}
        <div className="mb-4 text-gray-500 text-xs text-center">
          For testing, use OTP: {TEST_OTP}
        </div>

        {!otpSent ? (
          <div className="mb-4">
            <button
              onClick={sendOtp}
              disabled={sendingOtp}
              className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center"
            >
              {sendingOtp ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                  </svg>
                  Sending Verification Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Enter 6-digit OTP
            </label>
            <div className="flex justify-center gap-2 mb-4">
              {otpValue.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={() => handleFocus(index)}
                  maxLength="1"
                  className={`w-10 h-12 text-center text-xl font-medium border ${
                    activeInput === index ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none`}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={sendOtp}
              disabled={sendingOtp}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400"
            >
              {sendingOtp ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        )}

        {otpError && (
          <div className="bg-red-50 p-3 rounded-lg mb-4 flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-600 text-sm">{otpError}</p>
          </div>
        )}

        {otpSent && (
          <button
            onClick={verifyOtp}
            disabled={verifyingOtp || otpValue.some((digit) => digit === '')}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center"
          >
            {verifyingOtp ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

OtpVerification.propTypes = {
  phoneNumber: PropTypes.string.isRequired,
  onVerificationSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OtpVerification;