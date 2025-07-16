import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-7xl md:text-9xl font-bold text-[#2b7fff] mb-4">404</h1>
          <div className="w-24 h-1 bg-[#2b7fff] mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <h2 className="text-xl md:text-3xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 md:text-lg">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Countdown Component */}
        <p className="text-gray-700 mb-4">
            You will be redirected to the Home page in {countdown} seconds.
        </p>

        {/* Manual Navigation Button */}
        <Button
          onClick={() => navigate('/dashboard')}
          className="mt-4"
        >Go back to Home</Button>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;