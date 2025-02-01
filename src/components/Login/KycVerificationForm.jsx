import React, { useState } from 'react';
import { Mail, Smartphone, Check, ChevronRight } from 'lucide-react';

const KycVerificationForm = ({ onComplete }) => {
    const [showEmailOtp, setShowEmailOtp] = useState(false);
    const [showPhoneOtp, setShowPhoneOtp] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

    const handleComplete = () => {
      onComplete();
    };

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Verify Contact Details</h2>
          
          {/* Email Verification */}
          <div className="bg-white p-6 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email Verification</p>
                  <p className="text-sm text-gray-500">Verify your email address</p>
                </div>
              </div>
              {!emailVerified && (
                <button
                  onClick={() => setShowEmailOtp(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                    hover:bg-blue-100 transition-colors active:scale-95 transform duration-100"
                >
                  Verify Email
                </button>
              )}
              {emailVerified && (
                <div className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                  <Check className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
            
            {showEmailOtp && !emailVerified && (
              <div className="animate-slideDown">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                      focus:ring-blue-500 text-sm transition-all duration-200"
                  />
                  <button
                    onClick={() => setEmailVerified(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm 
                      hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the OTP sent to your email
                </p>
              </div>
            )}
          </div>

          {/* Phone Verification */}
          <div className="bg-white p-6 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Phone Verification</p>
                  <p className="text-sm text-gray-500">Verify your phone number</p>
                </div>
              </div>
              {!phoneVerified && (
                <button
                  onClick={() => setShowPhoneOtp(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium 
                    hover:bg-blue-100 transition-colors active:scale-95 transform duration-100"
                >
                  Verify Phone
                </button>
              )}
              {phoneVerified && (
                <div className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                  <Check className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
            
            {showPhoneOtp && !phoneVerified && (
              <div className="animate-slideDown">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                      focus:ring-blue-500 text-sm transition-all duration-200"
                  />
                  <button
                    onClick={() => setPhoneVerified(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm 
                      hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the OTP sent to your phone
                </p>
              </div>
            )}
          </div>
        </div>

        {emailVerified && phoneVerified && (
          <div className="animate-fadeIn">
            <button 
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all 
                duration-200 flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <span>Complete Registration</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
};

export default KycVerificationForm;
