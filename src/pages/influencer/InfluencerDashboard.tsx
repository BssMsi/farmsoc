
import React from 'react';
import { BarChart, LineChart, TrendingUp, ShoppingCart, Users, Eye } from 'lucide-react';

const InfluencerDashboard: React.FC = () => {
  // This would normally come from an API
  const metrics = {
    followers: 1250,
    growth: '+15%',
    posts: 24,
    engagement: '4.7%',
    impressions: 45800,
    clicks: 1240,
    conversions: 78
  };
  
  // Mock campaign data
  const campaigns = [
    {
      id: 'c1',
      farmerName: 'Jane Farmer',
      product: 'Organic Tomatoes',
      status: 'active',
      impressions: 12500,
      clicks: 450,
      conversions: 32,
      earnings: 6400
    },
    {
      id: 'c2',
      farmerName: 'Green Valley Farms',
      product: 'Fresh Spinach Bundle',
      status: 'completed',
      impressions: 8700,
      clicks: 320,
      conversions: 21,
      earnings: 3800
    },
    {
      id: 'c3',
      farmerName: 'Sunrise Orchards',
      product: 'Apple Basket',
      status: 'pending',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      earnings: 0
    }
  ];

  return (
    <div className="h-full bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-3">Dashboard</h1>
        <p className="text-gray-500">
          Track your performance and impact.
        </p>
      </div>
      
      <div className="p-4">
        {/* Metrics overview */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Performance Overview</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center text-gray-600 mb-1">
                <Users size={16} className="mr-1" />
                <span className="text-sm">Followers</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-xl font-bold">{metrics.followers}</div>
                <div className="text-sm text-green-600">{metrics.growth}</div>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center text-gray-600 mb-1">
                <Eye size={16} className="mr-1" />
                <span className="text-sm">Impressions</span>
              </div>
              <div className="text-xl font-bold">{metrics.impressions}</div>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center text-gray-600 mb-1">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm">Engagement Rate</span>
              </div>
              <div className="text-xl font-bold">{metrics.engagement}</div>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center text-gray-600 mb-1">
                <ShoppingCart size={16} className="mr-1" />
                <span className="text-sm">Conversions</span>
              </div>
              <div className="text-xl font-bold">{metrics.conversions}</div>
            </div>
          </div>
          
          {/* Growth chart placeholder */}
          <div className="p-3 border rounded-lg h-48 flex items-center justify-center">
            <div className="text-center">
              <LineChart size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                Growth analytics chart will appear here
              </p>
            </div>
          </div>
        </div>
        
        {/* Campaigns */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Campaign Performance</h2>
          
          {campaigns.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-gray-500">No campaigns yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="border rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="font-medium">{campaign.product}</div>
                      <div className="text-sm text-gray-500">by {campaign.farmerName}</div>
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full self-start ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Impressions</div>
                      <div className="font-medium">{campaign.impressions.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Clicks</div>
                      <div className="font-medium">{campaign.clicks.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Conversions</div>
                      <div className="font-medium">{campaign.conversions}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Earnings</div>
                      <div className="font-medium">₹{campaign.earnings}</div>
                    </div>
                  </div>
                  
                  {campaign.status === 'active' && (
                    <div className="mt-3 pt-3 border-t flex justify-end">
                      <button className="px-3 py-1 bg-kisanly-primary text-white text-sm rounded">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
