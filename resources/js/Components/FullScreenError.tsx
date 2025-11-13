
import React from 'react';

interface FullScreenErrorProps {
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const FullScreenError: React.FC<FullScreenErrorProps> = ({ title, message, children }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white font-sans p-4">
      <div className="text-center bg-red-900/50 border border-red-700 text-red-300 p-8 rounded-lg max-w-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-red-500">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        <h1 className="text-2xl font-bold mb-2 text-white">{title}</h1>
        <p className="mb-4">{message}</p>
        {children}
      </div>
    </div>
  );
};
