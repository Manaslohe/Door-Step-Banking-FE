import React from 'react';
import { motion } from 'framer-motion';

const RegisterTransition = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2300);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.h1 
          className="text-6xl font-bold mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          Let's Get You Started
        </motion.h1>
        
        <motion.p
          className="text-3xl text-blue-100 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          Your journey to modern banking begins here
        </motion.p>

        <motion.div
          className="mt-12"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          whileHover={{ scale: 1.1 }}
        >
          <svg
            className="w-24 h-24 mx-auto text-blue-200"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterTransition;