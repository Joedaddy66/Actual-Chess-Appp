import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string, nickname: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim() && nickname.trim()) {
      // In a real app, this is where you'd make an API call to your OAuth provider
      // e.g., await authService.login(username, password);
      onLogin(username, nickname);
    } else {
      setError('All fields are required.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/50 border border-gray-700/50 rounded-lg shadow-2xl p-8 backdrop-blur-sm">
        <h1 className="font-cinzel text-3xl font-bold text-red-500 text-center mb-2 tracking-widest">
          Core Engine Access
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Authentication Required
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 font-cinzel tracking-wider"
            >
              Operator Name
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-black/50 border border-gray-700/40 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-white"
              placeholder="e.g., Leonidas"
            />
          </div>
           <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-300 font-cinzel tracking-wider"
            >
              Faction (User Pool)
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-black/50 border border-gray-700/40 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-white"
              placeholder="e.g., Spartans"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 font-cinzel tracking-wider"
            >
              Access Key
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-black/50 border border-gray-700/40 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-white"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-red-700/80 rounded-md shadow-sm text-sm font-medium text-white bg-red-700/80 hover:bg-red-600/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors font-cinzel tracking-wider"
            >
              Authenticate & Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;