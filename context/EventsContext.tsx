// context/EventsContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { collection, query, getDocs, doc, addDoc, updateDoc, deleteDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '../services/firebase';

// Define types for our context
export type Event = {
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
  // Nouveaux champs pour différencier les événements
  eventType?: 'professional' | 'personal';
  service?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
};

type FirestoreBooking = {
  id?: string;
  address?: string;
  createdAt: Timestamp | string;
  date: Timestamp | string;
  email: string;
  message?: string;
  name: string;
  phone: string;
  service: string;
  status: string;
  time: string;
  eventType?: string; // Nouveau champ
};

type EventsContextType = {
  events: Event[];
  loading: boolean;
  addEvent: (event: Omit<Event, 'id'>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  refreshEvents: () => Promise<void>;
};

// Create the context with a default value
const EventsContext = createContext<EventsContextType>({
  events: [],
  loading: false,
  addEvent: async () => ({ id: '', title: '', startDate: '', endDate: '' }),
  updateEvent: async () => ({ id: '', title: '', startDate: '', endDate: '' }),
  deleteEvent: async () => {},
  getEventById: () => undefined,
  refreshEvents: async () => {},
});

// Custom hook to use the events context
export const useEvents = () => useContext(EventsContext);

// Helper to convert Firestore booking to app Event
const convertBookingToEvent = (booking: FirestoreBooking): Event => {
  // Créer une date à partir de la date et de l'heure de la réservation
  const dateParts = booking.date instanceof Timestamp 
    ? booking.date.toDate() 
    : new Date(booking.date as string);
  
  // Extraire les heures et minutes du format "10:00"
  const [hours, minutes] = booking.time.split(':').map(Number);
  
  // Définir l'heure de début
  const startDate = new Date(dateParts);
  startDate.setHours(hours, minutes, 0, 0);
  
  // Calculer l'heure de fin (par défaut 1h après)
  const endDate = new Date(startDate);
  
  // Durée en fonction du service (par exemple)
  let duration = 60; // 60 minutes par défaut
  if (booking.service === 'coloration') duration = 90;
  if (booking.service === 'cut_color') duration = 120;
  
  endDate.setMinutes(endDate.getMinutes() + duration);
  
  // Attribuer une couleur en fonction du service ou du type d'événement
  let color = '#007AFF'; // bleu par défaut
  let eventType: 'professional' | 'personal' = 'professional'; // Type par défaut
  
  // Vérifier si le type est explicitement défini
  if (booking.eventType) {
    eventType = booking.eventType as 'professional' | 'personal';
    if (eventType === 'personal') {
      color = '#FFCC00'; // Jaune pour événements personnels
    }
  }
  
  // Couleurs pour les événements professionnels en fonction du service
  if (eventType === 'professional') {
    if (booking.service === 'coloration') color = '#FF9500'; // orange
    if (booking.service === 'cut_color') color = '#FF3B30'; // rouge
    if (booking.service === 'Coupe') color = '#34C759'; // vert
  }
  
  return {
    id: booking.id || '',
    title: booking.name, // Peut être un titre personnel ou "Service - Nom du client"
    description: booking.message || '',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    location: booking.address || '',
    color,
    eventType,
    // Pour les événements professionnels seulement
    service: eventType === 'professional' ? booking.service : undefined,
    clientName: eventType === 'professional' ? booking.name.split(' - ')[1] : undefined,
    clientPhone: eventType === 'professional' ? booking.phone : undefined,
    clientEmail: eventType === 'professional' ? booking.email : undefined
  };
};

// Provider component that wraps the app and makes events object available
export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Charger les événements depuis Firestore
  useEffect(() => {
    refreshEvents();
  }, []);

  // Rafraîchir la liste des événements
  const refreshEvents = async () => {
    setLoading(true);
    try {
      const bookingsCollectionRef = collection(db, 'bookings');
      const bookingsQuery = query(bookingsCollectionRef);
      const querySnapshot = await getDocs(bookingsQuery);
      
      const bookings: FirestoreBooking[] = [];
      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data() as Omit<FirestoreBooking, 'id'>
        });
      });
      
      // Convertir les réservations Firestore en événements de l'application
      const newEvents = bookings.map(convertBookingToEvent);
      setEvents(newEvents);
      
    } catch (error) {
      console.error('Error loading events from Firestore:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements');
    } finally {
      setLoading(false);
    }
  };

  // Add a new event
  const addEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
    setLoading(true);
    try {
      // Créer l'événement dans Firestore
      const bookingsCollectionRef = collection(db, 'bookings');
      
      // Convertir l'événement en format Firestore
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      // Format pour Firestore
      let bookingData: any = {
        date: Timestamp.fromDate(startDate),
        time: `${startDate.getHours()}:${startDate.getMinutes().toString().padStart(2, '0')}`,
        address: event.location || '',
        message: event.description || '',
        status: 'confirmed',
        createdAt: Timestamp.now(),
        eventType: event.eventType || 'professional' // Stocker le type d'événement
      };
      
      // Données spécifiques selon le type d'événement
      if (event.eventType === 'professional') {
        // Pour un événement professionnel, le titre est au format "Service - Client"
        const titleParts = event.title.split(' - ');
        bookingData = {
          ...bookingData,
          name: event.title, // Titre complet
          service: event.service || titleParts[0] || 'Service',
          email: event.clientEmail || '',
          phone: event.clientPhone || '',
        };
      } else {
        // Pour un événement personnel, le titre est simplement le titre
        bookingData = {
          ...bookingData,
          name: event.title, // Titre direct
          email: '', // Pas de client pour les événements personnels
          phone: '',
          service: 'Personnel', // Marqueur pour les événements personnels
        };
      }
      
      const docRef = await addDoc(bookingsCollectionRef, bookingData);
      
      // Retourner l'événement avec l'ID généré
      const newEvent: Event = {
        ...event,
        id: docRef.id,
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
      // Mettre à jour l'événement dans Firestore
      const bookingRef = doc(db, 'bookings', id);
      
      // Préparer les données à mettre à jour
      const updateData: any = {};
      
      // Mise à jour selon le type d'événement
      if (eventUpdate.eventType) {
        updateData.eventType = eventUpdate.eventType;
      }
      
      if (eventUpdate.title) {
        updateData.name = eventUpdate.title;
        
        // Si c'est un événement professionnel, extraire service et client
        if (eventUpdate.eventType === 'professional' || 
            (events.find(e => e.id === id)?.eventType === 'professional' && !eventUpdate.eventType)) {
          const parts = eventUpdate.title.split(' - ');
          if (parts.length >= 2) {
            updateData.service = parts[0];
          }
        }
      }
      
      if (eventUpdate.service) {
        updateData.service = eventUpdate.service;
      }
      
      if (eventUpdate.clientEmail) {
        updateData.email = eventUpdate.clientEmail;
      }
      
      if (eventUpdate.clientPhone) {
        updateData.phone = eventUpdate.clientPhone;
      }
      
      if (eventUpdate.startDate) {
        const startDate = new Date(eventUpdate.startDate);
        updateData.date = Timestamp.fromDate(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
        updateData.time = `${startDate.getHours()}:${startDate.getMinutes().toString().padStart(2, '0')}`;
      }
      
      if (eventUpdate.location) updateData.address = eventUpdate.location;
      if (eventUpdate.description) updateData.message = eventUpdate.description;
      
      // Mettre à jour dans Firestore
      if (Object.keys(updateData).length > 0) {
        await updateDoc(bookingRef, updateData);
      }
      
      // Mettre à jour l'état local
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
      // Supprimer l'événement de Firestore
      const bookingRef = doc(db, 'bookings', id);
      await deleteDoc(bookingRef);
      
      // Mettre à jour l'état local
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
    refreshEvents
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};