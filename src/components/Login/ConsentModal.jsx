import React from 'react';
import { X, ChevronRight } from 'lucide-react';

const ConsentModal = ({ hasAgreed, setHasAgreed, onClose, onContinue }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-[40vh] shadow-xl relative animate-fadeIn flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
          <h3 className="text-lg font-medium text-gray-900">Declaration & Consent</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
  
        {/* Content - Using grid for better organization */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-700 mb-2">Data Collection</h4>
              <p className="text-gray-600">
                We collect and process your personal information including identification details, 
                contact information, and government-issued IDs for KYC verification.
              </p>
            </div>
  
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-700 mb-2">KYC Verification</h4>
              <p className="text-gray-600">
                Your identity will be verified through secure government databases. 
                Documents will be processed and stored following strict security protocols.
              </p>
            </div>
          </div>
  
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-lg border border-emerald-100">
              <h4 className="font-medium text-emerald-700 mb-2">Data Security</h4>
              <p className="text-gray-600">
                We implement industry-standard security measures to protect your information 
                and ensure compliance with data protection regulations.
              </p>
            </div>
  
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-lg border border-amber-100">
              <h4 className="font-medium text-amber-700 mb-2">Information Sharing</h4>
              <p className="text-gray-600">
                Your information may be shared with regulatory authorities, KYC verification 
                partners, and law enforcement agencies when required by law.
              </p>
            </div>
          </div>
        </div>
  
        {/* Footer */}
        <div className="px-6 py-4 border-t mt-auto bg-gray-50 rounded-b-lg shrink-0">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox"
                id="agreement"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 
                focus:ring-blue-500 transition-colors cursor-pointer"
              />
              <span className="text-sm text-gray-600">
                I agree to the terms outlined above
              </span>
            </label>
  
            {hasAgreed && (
              <button 
                onClick={onContinue}
                className="py-2 px-4 rounded-lg text-sm font-medium text-white
                bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 
                hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 
                transition-all duration-150 flex items-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

export default ConsentModal;
