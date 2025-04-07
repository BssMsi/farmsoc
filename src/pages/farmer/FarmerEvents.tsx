import React, { useState } from 'react';
import { Calendar, CalendarPlus, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getEvents, getFundraisers } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import EventCard from '../../components/common/EventCard';
import FundraiserCard from '../../components/common/FundraiserCard';

const FarmerEvents: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'fundraisers'>('events');
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  
  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents
  });
  
  const { data: fundraisers = [], isLoading: isFundraisersLoading } = useQuery({
    queryKey: ['fundraisers'],
    queryFn: getFundraisers
  });
  
  const myEvents = events.filter(event => event.creatorId === user?.id);
  
  const myFundraisers = fundraisers.filter(fundraiser => fundraiser.farmerId === user?.id);

  return (
    <div className="h-full bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Events & Fundraisers</h1>
        
        <div className="flex border-b">
          <button
            className={`pb-2 px-4 flex items-center ${
              activeTab === 'events' 
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => {
              setActiveTab('events');
              setShowNewEventForm(false);
            }}
          >
            <Calendar size={18} className="mr-1" />
            Events
          </button>
          <button
            className={`pb-2 px-4 flex items-center ${
              activeTab === 'fundraisers' 
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => {
              setActiveTab('fundraisers');
              setShowNewEventForm(false);
            }}
          >
            <Coins size={18} className="mr-1" />
            Fundraisers
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'events' && !showNewEventForm && (
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">Your Events</h2>
              <button 
                className="px-4 py-2 bg-farmsoc-primary text-white rounded-lg text-sm flex items-center"
                onClick={() => setShowNewEventForm(true)}
              >
                <CalendarPlus size={16} className="mr-1" />
                Create Event
              </button>
            </div>
            
            {isEventsLoading ? (
              <div className="text-center p-8">
                <div className="w-10 h-10 border-4 border-farmsoc-light border-t-farmsoc-primary rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading events...</p>
              </div>
            ) : myEvents.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">You haven't created any events yet.</p>
                <p className="text-sm text-gray-500 mt-1">Create your first event to connect with consumers.</p>
                <button 
                  className="mt-4 px-4 py-2 bg-farmsoc-primary text-white rounded-lg"
                  onClick={() => setShowNewEventForm(true)}
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'events' && showNewEventForm && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">Create New Event</h2>
              <button 
                className="text-gray-500"
                onClick={() => setShowNewEventForm(false)}
              >
                Cancel
              </button>
            </div>
            
            <form>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Description *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary h-24"
                    placeholder="Describe your event"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Event Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                    required
                  >
                    <option value="harvest">Harvest Activity</option>
                    <option value="workshop">Workshop</option>
                    <option value="market">Farmers Market</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                    placeholder="Enter event location"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Maximum Participants
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                    placeholder="Leave blank for unlimited"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Event Image
                  </label>
                  <div className="border rounded p-2 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-2">
                      In a real application, you would be able to upload an event image here.
                    </p>
                    <div className="bg-white border rounded w-full h-40 flex items-center justify-center">
                      <p className="text-gray-400">Image preview</p>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2 bg-farmsoc-primary text-white rounded-lg font-medium"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'fundraisers' && (
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">Your Fundraisers</h2>
              <button 
                className="px-4 py-2 bg-farmsoc-primary text-white rounded-lg text-sm flex items-center"
              >
                <Coins size={16} className="mr-1" />
                Start Fundraiser
              </button>
            </div>
            
            {isFundraisersLoading ? (
              <div className="text-center p-8">
                <div className="w-10 h-10 border-4 border-farmsoc-light border-t-farmsoc-primary rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading fundraisers...</p>
              </div>
            ) : myFundraisers.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">You haven't created any fundraisers yet.</p>
                <p className="text-sm text-gray-500 mt-1">Start a fundraiser to expand your farm or improve your operations.</p>
                <button 
                  className="mt-4 px-4 py-2 bg-farmsoc-primary text-white rounded-lg"
                >
                  Start Your First Fundraiser
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myFundraisers.map(fundraiser => (
                  <FundraiserCard key={fundraiser.id} fundraiser={fundraiser} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FarmerEvents;
