
import React, { useState } from 'react';
import { Filter, ThumbsUp, X } from 'lucide-react';

const InfluencerCollaborations: React.FC = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    compensation: 'all'
  });
  
  // Mock collaboration opportunities
  const collaborations = [
    {
      id: 'collab1',
      farmerName: 'Jane Farmer',
      farmName: 'Green Meadows Farm',
      location: 'Punjab, India',
      profileImage: 'https://i.pravatar.cc/150?img=4',
      title: 'Promote our organic vegetable line',
      description: 'Looking for food influencers to create authentic content showcasing our fresh organic vegetables. We focus on sustainable farming practices.',
      products: ['Organic Tomatoes', 'Spinach', 'Bell Peppers'],
      compensation: 'product + commission',
      status: 'open',
      deadline: new Date('2023-08-15')
    },
    {
      id: 'collab2',
      farmerName: 'Raj Kumar',
      farmName: 'Sunrise Grains',
      location: 'Haryana, India',
      profileImage: 'https://i.pravatar.cc/150?img=6',
      title: 'Rice cooking demonstrations',
      description: 'Seeking influencers who can showcase different recipes using our premium basmati rice. Ideal for cooking channels and food bloggers.',
      products: ['Premium Basmati Rice'],
      compensation: 'fixed + product',
      status: 'open',
      deadline: new Date('2023-08-20')
    },
    {
      id: 'collab3',
      farmerName: 'Aisha Patel',
      farmName: 'Honey Haven',
      location: 'Gujarat, India',
      profileImage: 'https://i.pravatar.cc/150?img=5',
      title: 'Natural honey product showcase',
      description: 'We produce artisanal honey varieties and are looking for wellness and food influencers to highlight the health benefits of our products.',
      products: ['Wildflower Honey', 'Jamun Honey', 'Litchi Honey'],
      compensation: 'commission',
      status: 'open',
      deadline: new Date('2023-08-25')
    }
  ];
  
  // Filter collaborations based on selected filters
  const filteredCollaborations = collaborations.filter(collab => {
    if (filters.status !== 'all' && collab.status !== filters.status) return false;
    if (filters.compensation !== 'all' && !collab.compensation.includes(filters.compensation)) return false;
    return true;
  });
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-3">Collaboration Opportunities</h1>
        <p className="text-gray-500">
          Connect with farmers to promote their products.
        </p>
      </div>
      
      <div className="p-4">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-4">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-medium">Filters</h2>
            <button
              className="flex items-center text-kisanly-primary"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={16} className="mr-1" />
              <span>{filterOpen ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>
          
          {filterOpen && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="applied">Applied</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Compensation Type
                </label>
                <select
                  value={filters.compensation}
                  onChange={(e) => setFilters({...filters, compensation: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                >
                  <option value="all">All Types</option>
                  <option value="product">Product Only</option>
                  <option value="fixed">Fixed Payment</option>
                  <option value="commission">Commission</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                  onClick={() => setFilters({status: 'all', type: 'all', compensation: 'all'})}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Collaboration opportunities */}
        {filteredCollaborations.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No collaboration opportunities found.</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCollaborations.map(collab => (
              <div key={collab.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 flex">
                  <img 
                    src={collab.profileImage} 
                    alt={collab.farmerName} 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{collab.title}</h3>
                        <div className="text-sm">
                          {collab.farmName} • {collab.location}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Deadline:</span> {formatDate(collab.deadline)}
                      </div>
                    </div>
                    
                    <p className="mt-2 text-gray-700">{collab.description}</p>
                    
                    <div className="mt-3">
                      <div className="text-sm text-gray-500 mb-1">Products:</div>
                      <div className="flex flex-wrap gap-1">
                        {collab.products.map((product, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-kisanly-light text-kisanly-dark text-xs rounded-full"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Compensation:</span> {collab.compensation}
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 border rounded-full">
                          <X size={16} className="text-gray-500" />
                        </button>
                        <button className="px-4 py-2 bg-kisanly-primary text-white rounded flex items-center">
                          <ThumbsUp size={16} className="mr-1" />
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerCollaborations;
