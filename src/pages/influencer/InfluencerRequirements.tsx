
import React from 'react';
import { Search } from 'lucide-react';

const InfluencerRequirements: React.FC = () => {
  // Mock farmer requirements
  const requirements = [
    {
      id: 'req1',
      farmerId: 'f1',
      farmerName: 'Jane Farmer',
      farmName: 'Green Meadows Farm',
      profileImage: 'https://i.pravatar.cc/150?img=4',
      title: 'Looking for food vlogger to showcase organic tomatoes',
      description: 'We need a food vlogger who can create content showcasing the superior taste and quality of our organic tomatoes. Ideal for cooking demonstrations, farm-to-table recipes, etc.',
      requirements: 'Minimum 10K followers on Instagram or YouTube. Experience in food content creation.',
      compensation: 'Product samples + commission on sales through your unique code',
      createdAt: new Date('2023-07-15'),
      status: 'open'
    },
    {
      id: 'req2',
      farmerId: 'f2',
      farmerName: 'Raj Kumar',
      farmName: 'Sunrise Grains',
      profileImage: 'https://i.pravatar.cc/150?img=6',
      title: 'Rice recipe content series',
      description: 'Looking for cooking influencers to create a series of recipes using our premium basmati rice. We need content that highlights the aroma, texture, and versatility of our rice.',
      requirements: 'Food blogger with strong engagement. Professional food photography skills preferred.',
      compensation: 'Fixed payment per post + product',
      createdAt: new Date('2023-07-10'),
      status: 'open'
    },
    {
      id: 'req3',
      farmerId: 'f3',
      farmerName: 'Aisha Patel',
      farmName: 'Honey Haven',
      profileImage: 'https://i.pravatar.cc/150?img=5',
      title: 'Wellness influencer for honey products',
      description: 'We produce artisanal honey varieties and need wellness influencers to create content on the health benefits of our products. Looking for authentic content showcasing how our honey can be incorporated into daily wellness routines.',
      requirements: 'Wellness/health niche with engaged followers. Knowledge about natural products.',
      compensation: 'Revenue share model',
      createdAt: new Date('2023-07-05'),
      status: 'open'
    }
  ];
  
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
        <h1 className="text-xl font-semibold mb-4">Farmer Requirements</h1>
        
        {/* Search bar */}
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search requirements..."
            className="w-full bg-gray-100 border-0 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-kisanly-primary"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
      </div>
      
      <div className="p-4">
        {requirements.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No requirements found.</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map(req => (
              <div key={req.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start">
                    <img 
                      src={req.profileImage} 
                      alt={req.farmerName} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold">{req.title}</h3>
                          <div className="text-sm text-gray-500">
                            {req.farmName} • Posted {formatDate(req.createdAt)}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full self-start ${
                          req.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-gray-700">{req.description}</p>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="text-sm font-medium">Requirements:</span>
                      <p className="text-gray-700 text-sm">{req.requirements}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Compensation:</span>
                      <p className="text-gray-700 text-sm">{req.compensation}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t flex justify-end">
                    <button className="px-4 py-2 bg-kisanly-primary text-white rounded">
                      Apply Now
                    </button>
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

export default InfluencerRequirements;
