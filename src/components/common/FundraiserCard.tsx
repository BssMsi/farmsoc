
import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Fundraiser } from '../../types/event';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { contributeToFundraiser } from '../../services/apiService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface FundraiserCardProps {
  fundraiser: Fundraiser;
}

const FundraiserCard: React.FC<FundraiserCardProps> = ({ fundraiser }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState(500);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  const contributeMutation = useMutation({
    mutationFn: () => {
      if (!user) return Promise.reject('User not logged in');
      
      return contributeToFundraiser(fundraiser.id, {
        userId: user.id,
        name: isAnonymous ? 'Anonymous' : user.name,
        amount: donationAmount,
        isAnonymous
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fundraisers'] });
      toast({
        title: "Contribution successful",
        description: `Thank you for your contribution of ₹${donationAmount}`,
      });
      setShowDonationForm(false);
    }
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const progressPercentage = Math.min((fundraiser.raised / fundraiser.goal) * 100, 100);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
      {fundraiser.image && (
        <img 
          src={fundraiser.image} 
          alt={fundraiser.title} 
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{fundraiser.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            fundraiser.status === 'active' ? 'bg-green-100 text-green-800' :
            fundraiser.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {fundraiser.status.charAt(0).toUpperCase() + fundraiser.status.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-600 mt-2 line-clamp-2">{fundraiser.description}</p>
        
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Raised: ₹{fundraiser.raised.toLocaleString()}</span>
            <span>Goal: ₹{fundraiser.goal.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-kisanly-primary h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {fundraiser.contributors.length} contributors • Ends on {formatDate(fundraiser.endDate)}
          </div>
        </div>
        
        {showDonationForm ? (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Donation Amount (₹)</label>
              <input 
                type="number" 
                min="100"
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
              />
            </div>
            <div className="mb-3 flex items-center">
              <input 
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">Donate anonymously</label>
            </div>
            <div className="flex space-x-2">
              <button 
                className="flex-1 py-2 bg-kisanly-primary text-white font-medium rounded"
                onClick={() => contributeMutation.mutate()}
                disabled={contributeMutation.isPending || donationAmount < 100}
              >
                {contributeMutation.isPending ? 'Processing...' : 'Confirm Donation'}
              </button>
              <button 
                className="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded"
                onClick={() => setShowDonationForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            {fundraiser.status === 'active' ? (
              <button 
                className="w-full py-2 bg-kisanly-primary text-white font-medium rounded flex items-center justify-center"
                onClick={() => setShowDonationForm(true)}
              >
                <CreditCard size={16} className="mr-2" />
                Contribute
              </button>
            ) : (
              <button 
                className="w-full py-2 bg-gray-200 text-gray-600 font-medium rounded"
                disabled
              >
                {fundraiser.status === 'completed' ? 'Fundraiser Completed' : 'Fundraiser Cancelled'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FundraiserCard;
