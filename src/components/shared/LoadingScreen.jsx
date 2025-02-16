import React from 'react';
import { motion } from 'framer-motion';
import logo from '../logo.svg';

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 z-50 flex items-center justify-center"
    >
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <img 
            src={logo} 
            alt="SaralBank Logo" 
            className="w-24 h-24 object-contain"
            style={{ filter: 'invert(27%) sepia(97%) saturate(1742%) hue-rotate(206deg) brightness(97%) contrast(101%)' }}
          />
          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-blue-600"
            initial={{ opacity: 0.3, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mt-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
        >
          Saral Banking
        </motion.h1>

        {/* Loading dots */}
        <div className="flex space-x-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full"
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
