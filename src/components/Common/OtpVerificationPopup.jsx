import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, MessageCircle, RefreshCw } from 'lucide-react';

const OtpVerificationPopup = ({ phoneNumber, onVerify, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const countdown = timer > 0 && setInterval(() => setTimer(timer - 1), 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < 5) {
      const nextInput = document.querySelector(`input[name='otp-${index + 1}']`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name='otp-${index - 1}']`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const enteredOtp = otp.join('');

    setTimeout(() => {
      if (enteredOtp === '000000') {
        onVerify();
      } else {
        setError('Invalid OTP. Please try again.');
        setIsSubmitting(false);
      }
    }, 1000);
  };

  const handleResendOTP = () => {
    setTimer(30);
    setError('');
    // Simulated OTP resend
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-gray-600 mb-2">
              Enter the 6-digit code sent to your mobile number ending with
              <span className="font-semibold"> ****8136</span>
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-600">
              For testing, use OTP: 000000
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  name={`otp-${index}`}
                  value={digit}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 border-2 rounded-lg text-center text-xl font-semibold
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all
                    outline-none"
                  maxLength={1}
                  required
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm animate-shake">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || otp.some(digit => !digit)}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2
                  ${isSubmitting ? 'bg-blue-100 text-blue-400' : 'bg-blue-600 text-white hover:bg-blue-700'}
                  transition-all duration-200`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Verify OTP
                  </>
                )}
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-gray-500 text-sm">
                    Resend OTP in <span className="font-medium">{timer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }

          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }

          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default OtpVerificationPopup;