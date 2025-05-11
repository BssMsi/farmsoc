import React, { useState } from 'react';
import { Calendar, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getEvents, getFundraisers, getCropRequests } from '../../services/apiService';
import EventCard from '../../components/common/EventCard';
import FundraiserCard from '../../components/common/FundraiserCard';
import CropRequestCard from '../../components/common/CropRequestCard';

const ConsumerEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'fundraisers' | 'crop-requests'>('events');
  
  // Get events
  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents
  });
  
  // Get fundraisers
  const { data: fundraisers = [], isLoading: isFundraisersLoading } = useQuery({
    queryKey: ['fundraisers'],
    queryFn: getFundraisers
  });
  
  // Get crop requests
  const { data: cropRequests = [], isLoading: isCropRequestsLoading } = useQuery({
    queryKey: ['cropRequests'],
    queryFn: getCropRequests
  });
  
  // Filter for upcoming events
  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  // Filter for active fundraisers
  const activeFundraisers = fundraisers.filter(fundraiser => fundraiser.status === 'active');
  // Filter for open crop requests
  const openCropRequests = cropRequests.filter(request => request.status === 'open');

  return (
    <div className="h-full bg-gray-50">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Events & Requests</h1>
        
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`pb-2 px-4 flex items-center ${
              activeTab === 'events' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={18} className="mr-1" />
            Events
          </button>
          <button
            className={`pb-2 px-4 flex items-center ${
              activeTab === 'fundraisers' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('fundraisers')}
          >
            <Coins size={18} className="mr-1" />
            Fundraisers
          </button>
          <button
            className={`pb-2 px-4 ${
              activeTab === 'crop-requests' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('crop-requests')}
          >
            Request Crops
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'events' && (
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">Upcoming Events</h2>
            </div>
            
            {isEventsLoading ? (
              <div className="text-center p-8">
                <div className="w-10 h-10 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading events...</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">No upcoming events.</p>
                <p className="text-sm text-gray-500 mt-1">Check back later for new events.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'fundraisers' && (
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">Active Fundraisers</h2>
            </div>
            
            {isFundraisersLoading ? (
              <div className="text-center p-8">
                <div className="w-10 h-10 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading fundraisers...</p>
              </div>
            ) : activeFundraisers.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">No active fundraisers.</p>
                <p className="text-sm text-gray-500 mt-1">Check back later for new fundraising campaigns.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeFundraisers.map(fundraiser => (
                  <FundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'crop-requests' && (
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">Crop Requests</h2>
              <button className="px-3 py-1 bg-kisanly-primary text-white rounded-lg text-sm">
                New Request
              </button>
            </div>
            
            {isCropRequestsLoading ? (
              <div className="text-center p-8">
                <div className="w-10 h-10 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading crop requests...</p>
              </div>
            ) : openCropRequests.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">No open crop requests.</p>
                <p className="text-sm text-gray-500 mt-1">Create a request for crops you'd like to see from local farmers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openCropRequests.map(request => (
                  <CropRequestCard key={request.id} cropRequest={request} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConsumerEvents;
