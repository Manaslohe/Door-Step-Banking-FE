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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            {/* Header with Aadhaar Logo */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="flex items-center space-x-4">
                    <img 
                        src="/aadhaar.png" 
                        alt="Aadhaar Logo" 
                        className="h-12"
                    />
                    <div>
                        <h2 className="text-xl font-bold text-[#1560BD]">Aadhaar Verification</h2>
                        <p className="text-sm text-gray-600">Unique Identification Authority of India</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Verification Instructions */}
                <div className="bg-[#f8f9fa] p-4 rounded-lg border border-[#1560BD]/20">
                    <p className="text-sm text-gray-700">
                        Please verify your contact details as per your Aadhaar card
                    </p>
                </div>

                {/* Email Verification Panel */}
                <div className="border rounded-lg p-5 bg-[#f8f9fa]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-[#1560BD] p-2 rounded-lg">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-[#1560BD]">ई-मेल पता / Email Address</p>
                                <p className="text-sm text-gray-600">Verify your email address</p>
                            </div>
                        </div>
                        {!emailVerified && (
                            <button
                                onClick={() => setShowEmailOtp(true)}
                                className="px-4 py-2 bg-[#1560BD] text-white rounded-lg text-sm font-medium 
                                    hover:bg-[#1151a3] transition-colors"
                            >
                                सत्यापित करें / Verify
                            </button>
                        )}
                        {emailVerified && (
                            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                                <Check className="w-5 h-5 mr-1" />
                                <span className="text-sm font-medium">सत्यापित / Verified</span>
                            </div>
                        )}
                    </div>
                    
                    {showEmailOtp && !emailVerified && (
                        <div className="animate-slideDown">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter OTP / ओटीपी दर्ज करें"
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                                        focus:ring-[#1560BD] text-sm"
                                />
                                <button
                                    onClick={() => setEmailVerified(true)}
                                    className="px-4 py-2 bg-[#1560BD] text-white rounded-lg text-sm 
                                        hover:bg-[#1151a3] transition-colors"
                                >
                                    जमा करें / Submit
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone Verification Panel */}
                <div className="border rounded-lg p-5 bg-[#f8f9fa]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-[#1560BD] p-2 rounded-lg">
                                <Smartphone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-[#1560BD]">मोबाइल नंबर / Mobile Number</p>
                                <p className="text-sm text-gray-600">Verify your phone number</p>
                            </div>
                        </div>
                        {!phoneVerified && (
                            <button
                                onClick={() => setShowPhoneOtp(true)}
                                className="px-4 py-2 bg-[#1560BD] text-white rounded-lg text-sm font-medium 
                                    hover:bg-[#1151a3] transition-colors"
                            >
                                सत्यापित करें / Verify
                            </button>
                        )}
                        {phoneVerified && (
                            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                                <Check className="w-5 h-5 mr-1" />
                                <span className="text-sm font-medium">सत्यापित / Verified</span>
                            </div>
                        )}
                    </div>
                    
                    {showPhoneOtp && !phoneVerified && (
                        <div className="animate-slideDown">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter OTP / ओटीपी दर्ज करें"
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                                        focus:ring-[#1560BD] text-sm"
                                />
                                <button
                                    onClick={() => setPhoneVerified(true)}
                                    className="px-4 py-2 bg-[#1560BD] text-white rounded-lg text-sm 
                                        hover:bg-[#1151a3] transition-colors"
                                >
                                    जमा करें / Submit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {emailVerified && phoneVerified && (
                <div className="mt-6 animate-fadeIn">
                    <button 
                        onClick={handleComplete}
                        className="w-full bg-[#1560BD] text-white py-3 rounded-lg 
                            hover:bg-[#1151a3] transition-all duration-200 flex 
                            items-center justify-center space-x-2 text-sm font-medium"
                    >
                        <span>आगे बढ़ें / Proceed</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t">
                <p className="text-xs text-center text-gray-500">
                    © Unique Identification Authority of India, 2023
                </p>
            </div>
        </div>
    );
};

export default KycVerificationForm;
