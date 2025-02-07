import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, children, type = 'customer' }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Helper function to get theme colors
  const getThemeColors = (type) => {
    switch (type) {
      case 'admin':
        return 'hover:bg-purple-50 text-purple-500 hover:text-purple-600';
      case 'agent':
        return 'hover:bg-orange-50 text-orange-500 hover:text-orange-600';
      default:
        return 'hover:bg-blue-50 text-blue-500 hover:text-blue-600';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[70] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring",
                duration: 0.5,
                bounce: 0.3
              }}
              className="w-full max-w-xl pointer-events-auto"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`absolute right-6 top-6 p-2.5 rounded-full transition-all duration-300 
                    shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm border-2 border-gray-100
                    ${getThemeColors(type)} z-10`}
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                </motion.button>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
