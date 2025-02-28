// context/SlotsContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getSlotsByDateRange, getAvailableSlots, bookSlot, cancelSlot, createSlot, Slot } from '../services/slotsService';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

// Define types for our context
type SlotsContextType = {
  slots: Slot[];
  loading: boolean;
  error: string | null;
  refreshSlots: (startDate?: Date, endDate?: Date) => Promise<void>;
  bookAppointment: (slotId: string, clientData: { clientName: string; clientPhone: string; clientEmail: string }) => Promise<boolean>;
  cancelAppointment: (slotId: string) => Promise<boolean>;
  createNewSlot: (slotData: Omit<Slot, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Slot>;
  getSlotById: (id: string) => Slot | undefined;
  getSlotsByDay: (date: Date) => Slot[];
};

// Create the context with a default value
const SlotsContext = createContext<SlotsContextType>({
  slots: [],
  loading: false,
  error: null,
  refreshSlots: async () => {},
  bookAppointment: async () => false,
  cancelAppointment: async () => false,
  createNewSlot: async () => ({ startDate: '', endDate: '', status: 'available' }),
  getSlotById: () => undefined,
  getSlotsByDay: () => [],
});

// Custom hook to use the slots context
export const useSlots = () => useContext(SlotsContext);

// Provider component that wraps the app and makes slots object available
export const SlotsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load of slots
  useEffect(() => {
    const loadInitialSlots = async () => {
      const today = new Date();
      const startDate = startOfMonth(today);
      const endDate = endOfMonth(addMonths(today, 2)); // 3 mois de créneaux
      
      refreshSlots(startDate, endDate);
    };

    loadInitialSlots();
  }, []);

  // Refresh slots data
  const refreshSlots = async (
    startDate: Date = startOfMonth(new Date()),
    endDate: Date = endOfMonth(addMonths(new Date(), 2))
  ) => {
    setLoading(true);
    setError(null);
    try {
      const slotsData = await getSlotsByDateRange(startDate, endDate);
      setSlots(slotsData);
    } catch (err) {
      console.error('Failed to load slots:', err);
      setError('Erreur lors du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  };

  // Book an appointment
  const bookAppointment = async (
    slotId: string,
    clientData: { clientName: string; clientPhone: string; clientEmail: string }
  ) => {
    setLoading(true);
    try {
      const result = await bookSlot(slotId, clientData);
      
      // Update local state
      setSlots(prevSlots => prevSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, ...clientData, status: 'booked' } 
          : slot
      ));
      
      return result;
    } catch (err) {
      console.error('Failed to book appointment:', err);
      setError('Erreur lors de la réservation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancel an appointment
  const cancelAppointment = async (slotId: string) => {
    setLoading(true);
    try {
      const result = await cancelSlot(slotId);
      
      // Update local state
      setSlots(prevSlots => prevSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, status: 'cancelled' } 
          : slot
      ));
      
      return result;
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      setError('Erreur lors de l\'annulation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create a new slot
  const createNewSlot = async (slotData: Omit<Slot, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newSlot = await createSlot(slotData);
      
      // Update local state
      setSlots(prevSlots => [...prevSlots, newSlot]);
      
      return newSlot;
    } catch (err) {
      console.error('Failed to create slot:', err);
      setError('Erreur lors de la création du créneau');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get slot by ID
  const getSlotById = (id: string): Slot | undefined => {
    return slots.find(slot => slot.id === id);
  };

  // Get slots for a specific day
  const getSlotsByDay = (date: Date): Slot[] => {
    const dateString = date.toISOString().split('T')[0];
    
    return slots.filter(slot => {
      const slotDateString = new Date(slot.startDate).toISOString().split('T')[0];
      return slotDateString === dateString;
    }).sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  };

  // Create the value object that will be provided by the context
  const value = {
    slots,
    loading,
    error,
    refreshSlots,
    bookAppointment,
    cancelAppointment,
    createNewSlot,
    getSlotById,
    getSlotsByDay,
  };

  return <SlotsContext.Provider value={value}>{children}</SlotsContext.Provider>;
};