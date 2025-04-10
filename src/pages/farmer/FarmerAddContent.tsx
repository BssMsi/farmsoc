import React, { useState, useEffect } from 'react';
import { Plus, X, Image as ImageIcon, Video, MapPin, Tag, IndianRupee, Calendar, Users, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createProduct, createPost, getFarmerProducts } from '../../services/apiService';
import { Product, ProductCategory } from '../../types/product';
import { Post, PostType } from '../../types/post';
import { useToast } from '@/hooks/use-toast';
import ProductForm from './components/ProductForm';
import PostForm from './components/PostForm';
import CollaborationForm from './components/CollaborationForm';
import CollaborationSearch from './components/CollaborationSearch';

// Mock influencer data for search
const mockInfluencers = [
  {
    id: 'i1',
    name: 'Sarah Johnson',
    age: 28,
    location: 'Mumbai, India',
    totalFollowers: 125000,
    compensation: ['product', 'fixed'],
    profileImage: 'https://i.pravatar.cc/150?img=1',
    platforms: [
      {
        name: 'Instagram',
        followers: 85000,
        engagement: '5.2%',
        username: '@sarahj_farmlife'
      },
      {
        name: 'YouTube',
        followers: 40000,
        engagement: '4.1%',
        username: '@sarahs_farm_diaries'
      }
    ],
    averageEngagement: '4.7%'
  },
  {
    id: 'i2',
    name: 'Raj Patel',
    age: 32,
    location: 'Delhi, India',
    totalFollowers: 85000,
    compensation: ['commission', 'product'],
    profileImage: 'https://i.pravatar.cc/150?img=2',
    platforms: [
      {
        name: 'Instagram',
        followers: 45000,
        engagement: '3.8%',
        username: '@raj_farmerslife'
      },
      {
        name: 'TikTok',
        followers: 40000,
        engagement: '2.6%',
        username: '@raj_farming'
      }
    ],
    averageEngagement: '3.2%'
  },
  {
    id: 'i3',
    name: 'Priya Sharma',
    age: 25,
    location: 'Bangalore, India',
    totalFollowers: 150000,
    compensation: ['fixed', 'commission'],
    profileImage: 'https://i.pravatar.cc/150?img=3',
    platforms: [
      {
        name: 'YouTube',
        followers: 90000,
        engagement: '5.8%',
        username: '@priyas_farm_kitchen'
      },
      {
        name: 'Instagram',
        followers: 60000,
        engagement: '4.4%',
        username: '@priya_farmfresh'
      }
    ],
    averageEngagement: '5.1%'
  }
];

const FarmerAddContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'product' | 'post' | 'collaboration'>('product');
  const [activeCollaborationTab, setActiveCollaborationTab] = useState<'search' | 'add'>('search');
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);

  const handleInfluencerSelected = (influencer: any) => {
    setSelectedInfluencer(influencer);
    setActiveCollaborationTab('add');
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Content</h1>
          <p className="text-gray-600">Create products, posts, or collaboration requirements</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4 bg-white p-2 rounded-lg shadow-md">
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === 'product'
                    ? 'bg-farmsoc-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('product')}
              >
                Add Product
              </button>
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === 'post'
                    ? 'bg-farmsoc-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('post')}
              >
                Create Post
              </button>
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === 'collaboration'
                    ? 'bg-farmsoc-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('collaboration')}
              >
                Collaboration
              </button>
            </div>
          </div>

          {/* Forms Container */}
          <div className="mt-6">
            {/* Product Form */}
            {activeTab === 'product' && <ProductForm />}

            {/* Post Form */}
            {activeTab === 'post' && <PostForm />}

            {/* Collaboration Tabs */}
            {activeTab === 'collaboration' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-4 bg-gray-100 p-2 rounded-lg">
                    <button
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        activeCollaborationTab === 'search'
                          ? 'bg-farmsoc-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveCollaborationTab('search')}
                    >
                      Search Influencers
                    </button>
                    <button
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        activeCollaborationTab === 'add'
                          ? 'bg-farmsoc-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveCollaborationTab('add')}
                    >
                      Add Requirement
                    </button>
                  </div>
                </div>

                {activeCollaborationTab === 'search' && (
                  <CollaborationSearch onInfluencerSelected={handleInfluencerSelected} />
                )}

                {activeCollaborationTab === 'add' && (
                  <CollaborationForm 
                    initialFollowerCount={selectedInfluencer?.totalFollowers?.toString()}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerAddContent;
