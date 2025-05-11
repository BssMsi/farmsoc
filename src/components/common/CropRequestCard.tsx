
import React from 'react';
import { ThumbsUp, Users } from 'lucide-react';
import { CropRequest } from '../../types/event';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { voteCropRequest } from '../../services/apiService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface CropRequestCardProps {
  cropRequest: CropRequest;
  onFulfill?: (requestId: string) => void;
}

const CropRequestCard: React.FC<CropRequestCardProps> = ({ cropRequest, onFulfill }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const voteMutation = useMutation({
    mutationFn: () => voteCropRequest(cropRequest.id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cropRequests'] });
      toast({
        title: "Vote added",
        description: "Your vote has been added to this crop request",
      });
    }
  });

  const hasUserVoted = user && cropRequest.voterIds.includes(user.id);
  const isFarmer = user?.role === 'farmer';

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{cropRequest.cropName}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            cropRequest.status === 'open' ? 'bg-green-100 text-green-800' :
            cropRequest.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {cropRequest.status.charAt(0).toUpperCase() + cropRequest.status.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-600 mt-2">{cropRequest.description}</p>
        
        {cropRequest.image && (
          <img 
            src={cropRequest.image} 
            alt={cropRequest.cropName} 
            className="w-full h-36 object-cover mt-3 rounded"
          />
        )}
        
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <Users size={16} className="mr-2" />
          <span>{cropRequest.votes} voters interested in this crop</span>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {cropRequest.status === 'open' && !hasUserVoted && !isFarmer && (
            <button 
              className="flex-1 py-2 bg-kisanly-light text-kisanly-dark font-medium rounded flex items-center justify-center"
              onClick={() => voteMutation.mutate()}
              disabled={voteMutation.isPending}
            >
              <ThumbsUp size={16} className="mr-2" />
              {voteMutation.isPending ? 'Voting...' : 'Vote'}
            </button>
          )}
          
          {cropRequest.status === 'open' && hasUserVoted && !isFarmer && (
            <button 
              className="flex-1 py-2 bg-gray-200 text-gray-600 font-medium rounded flex items-center justify-center"
              disabled
            >
              <ThumbsUp size={16} className="mr-2" />
              Voted
            </button>
          )}
          
          {cropRequest.status === 'open' && isFarmer && (
            <button 
              className="flex-1 py-2 bg-kisanly-primary text-white font-medium rounded"
              onClick={() => onFulfill && onFulfill(cropRequest.id)}
            >
              Fulfill This Request
            </button>
          )}
          
          {cropRequest.status !== 'open' && (
            <button 
              className="flex-1 py-2 bg-gray-200 text-gray-600 font-medium rounded"
              disabled
            >
              {cropRequest.status === 'fulfilled' ? 'Request Fulfilled' : 'Request Cancelled'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropRequestCard;
