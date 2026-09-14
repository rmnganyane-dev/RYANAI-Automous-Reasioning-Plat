import React, { useState } from 'react';

export const AuthPage: React.FC = () => {
  const [token, setToken] = useState<string>('');

  return (
    <div className="auth-container p-6 max-w-md mx-auto bg-slate-900 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">RyanAI Authentication</h2>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter Access Token"
        className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 mb-4"
      />
      <button 
        onClick={() => console.log('Authenticating with token:', token)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
      >
        Authenticate
      </button>
    </div>
  );
};