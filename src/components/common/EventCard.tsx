
import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '../../types/event';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { joinEvent } from '../../services/apiService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const joinEventMutation = useMutation({
    mutationFn: () => joinEvent(event.id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Joined event",
        description: `You have successfully joined ${event.title}`,
      });
    }
  });
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUserJoined = user && event.participants.includes(user.id);
  const isEventFull = event.maxParticipants !== undefined && event.currentParticipants >= event.maxParticipants;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
      {event.image && (
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
            event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-2" />
            {formatDate(event.startDate)} • {formatTime(event.startDate)} - {formatTime(event.endDate)}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={16} className="mr-2" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users size={16} className="mr-2" />
            {event.currentParticipants} {event.maxParticipants ? `/ ${event.maxParticipants}` : ''} participants
          </div>
        </div>
        
        <div className="mt-4">
          {isUserJoined ? (
            <button 
              className="w-full py-2 bg-kisanly-light text-kisanly-dark font-medium rounded"
              disabled
            >
              Already Joined
            </button>
          ) : event.status !== 'upcoming' ? (
            <button 
              className="w-full py-2 bg-gray-200 text-gray-600 font-medium rounded"
              disabled
            >
              {event.status === 'completed' ? 'Event Completed' : 
               event.status === 'cancelled' ? 'Event Cancelled' : 'Event Ongoing'}
            </button>
          ) : isEventFull ? (
            <button 
              className="w-full py-2 bg-gray-200 text-gray-600 font-medium rounded"
              disabled
            >
              Event Full
            </button>
          ) : (
            <button 
              className="w-full py-2 bg-kisanly-primary text-white font-medium rounded hover:bg-kisanly-dark"
              onClick={() => joinEventMutation.mutate()}
              disabled={joinEventMutation.isPending}
            >
              {joinEventMutation.isPending ? 'Joining...' : 'Join Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
