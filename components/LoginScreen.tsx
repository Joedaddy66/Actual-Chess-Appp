import React from 'react';

interface LoginScreenProps {
  onLogin: () => Promise<void>;
  loading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loading }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/50 border border-gray-700/50 rounded-lg shadow-2xl p-8 backdrop-blur-sm">
        <h1 className="font-cinzel text-3xl font-bold text-red-500 text-center mb-2 tracking-widest">
          Core Engine Access
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Zero-Trust Authentication Required
        </p>
        <div className="mt-6">
          <button
            onClick={onLogin}
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2 -ml-1" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <title>Google icon</title>
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-4.64 0-8.59-3.82-8.59-8.59s3.95-8.59 8.59-8.59c2.5 0 4.13 1 4.92 1.88l2.5-2.5C20.46.93 18.06 0 15.14 0 9.29 0 4.75 4.38 4.75 10s4.54 10 10.39 10c2.83 0 5.2-1 6.88-2.65.8-.8 1.32-1.8 1.5-3.05H12.48z" fill="#4285F4"/>
            </svg>
            Sign in with Google
          </button>
        </div>
        {loading && <p className="text-center text-gray-400 mt-4">Authenticating...</p>}
      </div>
    </div>
  );
};

export default LoginScreen;
