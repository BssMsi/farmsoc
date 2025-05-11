import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AddContentTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Determine active tab based on URL
  const getActiveTab = () => {
    if (path.includes('/add/product')) return 'product';
    if (path.includes('/add/post')) return 'post';
    if (path.includes('/add/collaboration')) return 'collaboration';
    return 'product'; // Default
  };

  const activeTab = getActiveTab();

  // Navigate to the appropriate tab with absolute path
  const handleTabChange = (tab: 'product' | 'post' | 'collaboration') => {
    navigate(`/app/add/${tab}`);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Content</h1>
        <p className="text-gray-600">Create products, posts, or collaboration requirements</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4 bg-white p-2 rounded-lg shadow-md">
          <button
            className={`px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'product'
                ? 'bg-kisanly-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('product')}
          >
            Add Product
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'post'
                ? 'bg-kisanly-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('post')}
          >
            Create Post
          </button>
          <button
            className={`px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'collaboration'
                ? 'bg-kisanly-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('collaboration')}
          >
            Collaboration
          </button>
        </div>
      </div>
    </>
  );
};

export default AddContentTabs; 