import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessAnimation = ({ onComplete }) => {
  const navigate = useNavigate();
  const [showElements, setShowElements] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  const handleRedirect = React.useCallback(() => {
    navigate('/login');
  }, [navigate]);

  React.useEffect(() => {
    try {
      // Optimize animation timings
      const showTimer = setTimeout(() => setShowElements(true),1200);
      const loadingTimer = setTimeout(() => setIsLoading(false), 2200);
      
      // Automatic redirect after animation
      const redirectTimer = setTimeout(() => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
        handleRedirect();
      }, 4000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(loadingTimer);
        clearTimeout(redirectTimer);
      };
    } catch (err) {
      setError('Animation failed to load');
      console.error('Animation error:', err);
    }
  }, [onComplete, handleRedirect]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-blue-600 flex items-center justify-center z-50">
        <div className="text-white text-xl">
          {error}. Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-blue-600 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl mx-4">
        <div className="text-center space-y-8">
          {/* Animated Circle with Check Icon */}
          <div className="relative mx-auto w-40 h-40">
            <div className="absolute inset-0">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 100 100"
                style={{ willChange: 'transform' }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="white"
                  className="animate-scale-in"
                  style={{ transform: 'translateZ(0)' }}
                />
                
                {showElements && (
                  <path
                    d="M30 50 L50 70 L70 30"
                    stroke="#2563EB"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-draw-check-1"
                    style={{ transform: 'translateZ(0)' }}
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Main Text */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl font-bold text-white">
              Success!
            </h1>
            <p className="text-2xl text-blue-100">
              {isLoading ? 'Setting up your account...' : 'Your account is ready!'}
            </p>
          </div>

          {/* Loading indicator */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 animate-slide-up">
            <div className="text-white text-xl flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <span className="animate-pulse">Preparing your experience</span>
                  <span className="animate-bounce">...</span>
                </>
              ) : (
                'Redirecting to your dashboard'
              )}
            </div>
          </div>

          {/* Manual redirect button */}
          <button
            onClick={handleRedirect}
            className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-200 animate-fade-in"
          >
            Click here to login
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes draw-check-1 {
          from { stroke-dasharray: 0 100; stroke-dashoffset: 0; }
          to { stroke-dasharray: 100 100; stroke-dashoffset: 0; }
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          will-change: transform;
        }

        .animate-draw-check-1 {
          stroke-dasharray: 0 100;
          animation: draw-check-1 0.3s ease-out 0.4s forwards;
          will-change: stroke-dasharray;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.8s both;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out 1.1s both;
        }
      `}</style>
    </div>
  );
};

export default SuccessAnimation;