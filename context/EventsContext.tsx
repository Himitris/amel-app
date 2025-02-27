import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

// Define types for our context
type Event = {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  color?: string;
  participants?: string[];
  reminder?: boolean;
  reminderTime?: number;
};

type EventsContextType = {
  events: Event[];
  loading: boolean;
  addEvent: (event: Omit<Event, 'id'>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
};

// Create the context with a default value
const EventsContext = createContext<EventsContextType>({
  events: [],
  loading: false,
  addEvent: async () => ({ id: '', title: '', startDate: '', endDate: '' }),
  updateEvent: async () => ({ id: '', title: '', startDate: '', endDate: '' }),
  deleteEvent: async () => {},
  getEventById: () => undefined,
});

// Custom hook to use the events context
export const useEvents = () => useContext(EventsContext);

// Provider component that wraps the app and makes events object available
export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Mock data for demo purposes
  // In a real app, this would connect to Firebase Firestore
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        // Mock fetching events from a database
        // In a real app, this would query Firestore
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Réunion d\'équipe',
            description: 'Réunion hebdomadaire pour discuter des avancées du projet',
            startDate: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
            endDate: new Date(today.setHours(11, 30, 0, 0)).toISOString(),
            location: 'Salle de conférence A',
            color: '#007AFF',
            participants: ['user1', 'user2', 'user3'],
          },
          {
            id: '2',
            title: 'Déjeuner avec client',
            description: 'Présentation des nouvelles fonctionnalités',
            startDate: new Date(today.setHours(12, 30, 0, 0)).toISOString(),
            endDate: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
            location: 'Restaurant Le Central',
            color: '#FF9500',
          },
          {
            id: '3',
            title: 'Rendez-vous médecin',
            startDate: new Date(tomorrow.setHours(15, 0, 0, 0)).toISOString(),
            endDate: new Date(tomorrow.setHours(16, 0, 0, 0)).toISOString(),
            location: 'Cabinet Dr. Martin',
            color: '#FF3B30',
            reminder: true,
            reminderTime: 60, // 60 minutes before
          },
          {
            id: '4',
            title: 'Cours de yoga',
            startDate: new Date(nextWeek.setHours(18, 0, 0, 0)).toISOString(),
            endDate: new Date(nextWeek.setHours(19, 30, 0, 0)).toISOString(),
            location: 'Studio Zen',
            color: '#34C759',
            reminder: true,
            reminderTime: 30, // 30 minutes before
          },
        ];
        
        setEvents(mockEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Add a new event
  const addEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
    setLoading(true);
    try {
      // Mock adding an event to the database
      // In a real app, this would add a document to Firestore
      
      const newEvent: Event = {
        ...event,
        id: 'event' + Date.now(),
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      return newEvent;
    } catch (error) {
      console.error('Add event error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing event
  const updateEvent = async (id: string, eventUpdate: Partial<Event>): Promise<Event> => {
    setLoading(true);
    try {
      // Mock updating an event in the database
      // In a real app, this would update a document in Firestore
      
      const updatedEvents = events.map(event => {
        if (event.id === id) {
          return { ...event, ...eventUpdate };
        }
        return event;
      });
      
      setEvents(updatedEvents);
      
      const updatedEvent = updatedEvents.find(event => event.id === id);
      
      if (!updatedEvent) {
        throw new Error('Event not found');
      }
      
      return updatedEvent;
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // Mock deleting an event from the database
      // In a real app, this would delete a document from Firestore
      
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get an event by ID
  const getEventById = (id: string): Event | undefined => {
    return events.find(event => event.id === id);
  };

  // Create the value object that will be provided by the context
  const value = {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};