import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface Influencer {
  id: string;
  name: string;
  age: number;
  location: string;
  totalFollowers: number;
  compensation: string[];
  profileImage: string;
  platforms: {
    name: string;
    followers: number;
    engagement: string;
    username: string;
  }[];
  averageEngagement: string;
}

interface CollaborationSearchProps {
  onInfluencerSelected?: (influencer: Influencer) => void;
}

const mockInfluencers: Influencer[] = [
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

const CollaborationSearch: React.FC<CollaborationSearchProps> = ({ onInfluencerSelected }) => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    minAge: '',
    maxAge: '',
    minCompensation: '',
    maxCompensation: '',
    minFollowers: '',
    maxFollowers: ''
  });

  const handleSearch = () => {
    // TODO: Implement influencer search with filters
    console.log('Searching with filters:', {
      location: searchFilters.location,
      ageRange: `${searchFilters.minAge}-${searchFilters.maxAge}`,
      followerRange: `${searchFilters.minFollowers}-${searchFilters.maxFollowers}`,
      compensationRange: `${searchFilters.minCompensation}-${searchFilters.maxCompensation}`
    });
  };

  // Filter influencers based on search criteria
  const filteredInfluencers = mockInfluencers.filter(influencer => {
    if (searchFilters.location && !influencer.location.toLowerCase().includes(searchFilters.location.toLowerCase())) {
      return false;
    }
    if (searchFilters.minAge && influencer.age < parseInt(searchFilters.minAge)) {
      return false;
    }
    if (searchFilters.maxAge && influencer.age > parseInt(searchFilters.maxAge)) {
      return false;
    }
    if (searchFilters.minFollowers && influencer.totalFollowers < parseInt(searchFilters.minFollowers)) {
      return false;
    }
    if (searchFilters.maxFollowers && influencer.totalFollowers > parseInt(searchFilters.maxFollowers)) {
      return false;
    }
    if (searchFilters.minCompensation && !influencer.compensation.includes(searchFilters.minCompensation)) {
      return false;
    }
    if (searchFilters.maxCompensation && !influencer.compensation.includes(searchFilters.maxCompensation)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="Enter location"
              value={searchFilters.location}
              onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Age
              </label>
              <input
                type="number"
                placeholder="Min"
                value={searchFilters.minAge}
                onChange={(e) => setSearchFilters({ ...searchFilters, minAge: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Age
              </label>
              <input
                type="number"
                placeholder="Max"
                value={searchFilters.maxAge}
                onChange={(e) => setSearchFilters({ ...searchFilters, maxAge: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Followers
              </label>
              <input
                type="number"
                placeholder="Min"
                value={searchFilters.minFollowers}
                onChange={(e) => setSearchFilters({ ...searchFilters, minFollowers: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Followers
              </label>
              <input
                type="number"
                placeholder="Max"
                value={searchFilters.maxFollowers}
                onChange={(e) => setSearchFilters({ ...searchFilters, maxFollowers: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compensation Type
            </label>
            <div className="flex flex-wrap gap-2">
              {['product', 'fixed', 'commission'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    if (searchFilters.minCompensation === type) {
                      setSearchFilters({ ...searchFilters, minCompensation: '' });
                    } else {
                      setSearchFilters({ ...searchFilters, minCompensation: type });
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    searchFilters.minCompensation === type
                      ? 'bg-farmsoc-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-6 py-2 bg-farmsoc-primary text-white rounded-lg hover:bg-farmsoc-primary/90 transition-colors"
          >
            Search Influencers
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredInfluencers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No influencers found matching your criteria.</p>
          </div>
        ) : (
          filteredInfluencers.map(influencer => (
            <div key={influencer.id} className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={influencer.profileImage}
                    alt={influencer.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">{influencer.name}</h3>
                      <p className="text-sm text-gray-500">{influencer.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{influencer.totalFollowers.toLocaleString()} total followers</p>
                      <p className="text-sm text-gray-500">{influencer.averageEngagement} avg. engagement</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    {influencer.platforms.map(platform => (
                      <div key={platform.name} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{platform.name}</span>
                            <span className="text-sm text-gray-500">{platform.username}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{platform.followers.toLocaleString()} followers</p>
                            <p className="text-sm text-gray-500">{platform.engagement} engagement</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {influencer.compensation.map(type => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-farmsoc-light text-farmsoc-dark rounded-full text-xs"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-4 py-2 bg-farmsoc-primary text-white rounded-lg hover:bg-farmsoc-primary/90 transition-colors w-full sm:w-auto"
                      onClick={() => onInfluencerSelected?.(influencer)}
                    >
                      Create Collaboration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollaborationSearch; 