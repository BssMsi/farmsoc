
import React from 'react';
import { ThumbsUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCropRequests } from '../../services/apiService';
import CropRequestCard from '../../components/common/CropRequestCard';
import { useToast } from '@/hooks/use-toast';

const FarmerCropRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get crop requests
  const { data: cropRequests = [], isLoading } = useQuery({
    queryKey: ['cropRequests'],
    queryFn: getCropRequests
  });
  
  // Filter for open crop requests
  const openRequests = cropRequests.filter(request => request.status === 'open');
  
  // Sort by number of votes (most popular first)
  const sortedRequests = [...openRequests].sort((a, b) => b.votes - a.votes);
  
  // Handle fulfill request
  const handleFulfillRequest = (requestId: string) => {
    // This would normally call an API to update the request status
    toast({
      title: "Request acceptance",
      description: "You have committed to fulfill this crop request! This feature is not fully implemented in the demo.",
    });
  };

  return (
    <div className="h-full bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Crop Demand Requests</h1>
        <p className="text-gray-500 text-sm mt-1">
          View popular crop requests from consumers and choose the ones you'd like to fulfill.
        </p>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="w-10 h-10 border-4 border-farmsoc-light border-t-farmsoc-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading crop requests...</p>
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No crop requests available at the moment.</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for new requests from consumers.</p>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center text-gray-600">
              <ThumbsUp size={16} className="mr-1" />
              <span className="text-sm">Requests are sorted by popularity</span>
            </div>
            
            <div className="space-y-4">
              {sortedRequests.map(request => (
                <CropRequestCard 
                  key={request.id} 
                  cropRequest={request}
                  onFulfill={handleFulfillRequest}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerCropRequests;
