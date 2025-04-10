import React, { useState } from 'react';
import { IndianRupee, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CompensationTypeSelector from './shared/CompensationTypeSelector';
import PlatformSelector from './shared/PlatformSelector';

interface CollaborationFormProps {
  onCollaborationCreated?: () => void;
  initialFollowerCount?: string;
}

const CollaborationForm: React.FC<CollaborationFormProps> = ({ 
  onCollaborationCreated,
  initialFollowerCount = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [compensationType, setCompensationType] = useState<'monetary' | 'product'>('monetary');
  const [collaborationBudget, setCollaborationBudget] = useState('');
  const [collaborationTimeline, setCollaborationTimeline] = useState('');
  const [collaborationRequirements, setCollaborationRequirements] = useState('');
  const [collaborationPlatforms, setCollaborationPlatforms] = useState<string[]>([]);
  const [collaborationFollowerCount, setCollaborationFollowerCount] = useState(initialFollowerCount);
  const [collaborationDeadline, setCollaborationDeadline] = useState('');
  const [productExchangeName, setProductExchangeName] = useState('');
  const [productExchangeQuantity, setProductExchangeQuantity] = useState('');

  const handleAddCollaboration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const collaborationData = {
      farmerId: user?.id || '',
      farmerName: user?.name || '',
      compensationType,
      ...(compensationType === 'monetary' 
        ? { budget: parseFloat(collaborationBudget) }
        : { 
            productName: productExchangeName,
            productQuantity: parseInt(productExchangeQuantity)
          }
      ),
      timeline: collaborationTimeline,
      requirements: collaborationRequirements,
      platforms: collaborationPlatforms,
      followerCount: parseInt(collaborationFollowerCount),
      deadline: new Date(collaborationDeadline),
      status: 'open',
      createdAt: new Date()
    };

    try {
      // TODO: Implement API call to create collaboration
      toast({
        title: "Collaboration created",
        description: "Your collaboration requirement has been posted successfully",
      });
      
      // Reset form
      setCollaborationBudget('');
      setCollaborationTimeline('');
      setCollaborationRequirements('');
      setCollaborationPlatforms([]);
      setCollaborationFollowerCount('');
      setCollaborationDeadline('');
      setProductExchangeName('');
      setProductExchangeQuantity('');
      
      if (onCollaborationCreated) {
        onCollaborationCreated();
      }
    } catch (error) {
      toast({
        title: "Error creating collaboration",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleAddCollaboration} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CompensationTypeSelector
          compensationType={compensationType}
          setCompensationType={setCompensationType}
        />

        {compensationType === 'monetary' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                type="number"
                placeholder="Enter budget in INR"
                value={collaborationBudget}
                onChange={(e) => setCollaborationBudget(e.target.value)}
                required
              />
            </div>
          </div>
        ) : (
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                type="text"
                placeholder="Enter product name"
                value={productExchangeName}
                onChange={(e) => setProductExchangeName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                type="number"
                placeholder="Enter quantity"
                value={productExchangeQuantity}
                onChange={(e) => setProductExchangeQuantity(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeline
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
              type="text"
              placeholder="e.g., 2 weeks, 1 month"
              value={collaborationTimeline}
              onChange={(e) => setCollaborationTimeline(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Follower Count
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
              type="number"
              placeholder="Enter minimum follower count"
              value={collaborationFollowerCount}
              onChange={(e) => setCollaborationFollowerCount(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deadline
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
            type="date"
            value={collaborationDeadline}
            onChange={(e) => setCollaborationDeadline(e.target.value)}
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requirements
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
            rows={3}
            placeholder="Enter specific requirements for the collaboration"
            value={collaborationRequirements}
            onChange={(e) => setCollaborationRequirements(e.target.value)}
            required
          />
        </div>

        <PlatformSelector
          platforms={collaborationPlatforms}
          setPlatforms={setCollaborationPlatforms}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-farmsoc-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-farmsoc-primary/90 transition-colors"
      >
        Post Collaboration Requirement
      </button>
    </form>
  );
};

export default CollaborationForm; 