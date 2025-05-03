import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CollaborationForm from '../components/CollaborationForm';
import CollaborationSearch from '../components/CollaborationSearch';
import AddContentTabs from '../components/shared/AddContentTabs';

const FarmerAddCollaboration: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'search' | 'add'>('search');
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [formInitialValues, setFormInitialValues] = useState<{
    compensationType?: 'monetary' | 'product';
    budget?: string;
    timeline?: string;
    requirements?: string;
    platforms?: string[];
    followerCount?: string;
    deadline?: string;
    productName?: string;
    productQuantity?: string;
  }>({});

  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);
    const initialValues: any = {};

    // Extract parameters that match form fields
    if (searchParams.has('compensationType')) {
      const type = searchParams.get('compensationType');
      if (type === 'monetary' || type === 'product') {
        initialValues.compensationType = type;
      }
    }

    if (searchParams.has('budget')) initialValues.budget = searchParams.get('budget') || '';
    if (searchParams.has('timeline')) initialValues.timeline = searchParams.get('timeline') || '';
    if (searchParams.has('requirements')) initialValues.requirements = searchParams.get('requirements') || '';
    if (searchParams.has('followerCount')) initialValues.followerCount = searchParams.get('followerCount') || '';
    if (searchParams.has('deadline')) initialValues.deadline = searchParams.get('deadline') || '';
    if (searchParams.has('productName')) initialValues.productName = searchParams.get('productName') || '';
    if (searchParams.has('productQuantity')) initialValues.productQuantity = searchParams.get('productQuantity') || '';
    
    // Handle platforms as comma separated values
    if (searchParams.has('platforms')) {
      const platformsString = searchParams.get('platforms') || '';
      if (platformsString) {
        initialValues.platforms = platformsString.split(',');
      }
    }

    setFormInitialValues(initialValues);
    
    // If we have query parameters, automatically switch to the add tab
    if (Object.keys(initialValues).length > 0) {
      setActiveTab('add');
    }
  }, [location.search]);

  const handleInfluencerSelected = (influencer: any) => {
    setSelectedInfluencer(influencer);
    setActiveTab('add');
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <AddContentTabs />
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-center mb-6">
            <div className="flex space-x-4 bg-gray-100 p-2 rounded-lg">
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === 'search'
                    ? 'bg-farmsoc-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('search')}
              >
                Search Influencers
              </button>
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === 'add'
                    ? 'bg-farmsoc-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('add')}
              >
                Add Requirement
              </button>
            </div>
          </div>

          {activeTab === 'search' && (
            <CollaborationSearch onInfluencerSelected={handleInfluencerSelected} />
          )}

          {activeTab === 'add' && (
            <CollaborationForm 
              initialFollowerCount={selectedInfluencer?.totalFollowers?.toString()}
              initialValues={formInitialValues}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerAddCollaboration; 