import React from 'react';
import DashBoardauthContent from '../components/dashBoardauth';
import DashBoardauthContent from '../components/dashBoardauth/DashBoardauth';

export default function DashBoardauth() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800"> (Auth Settings)</h1>
        <DashBoardauthContent />
      </div>
    </div>
  );
}