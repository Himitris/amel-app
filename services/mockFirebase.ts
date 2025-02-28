// services/mockFirebase.ts
import { Timestamp } from 'firebase/firestore';
import { Slot } from './slotsService';

// Mock data pour les slots
const generateMockSlots = (): Slot[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return [
    {
      id: '1',
      service: 'Coupe',
      price: 35,
      status: 'available',
      startDate: new Date(now.setHours(10, 0, 0)).toISOString(),
      endDate: new Date(now.setHours(11, 0, 0)).toISOString(),
      location: 'Salon de coiffure',
    },
    {
      id: '2',
      service: 'Coloration',
      price: 60,
      status: 'booked',
      startDate: new Date(tomorrow.setHours(14, 0, 0)).toISOString(),
      endDate: new Date(tomorrow.setHours(15, 30, 0)).toISOString(),
      location: 'Salon de coiffure',
      clientName: 'Marie Dupont',
      clientPhone: '0612345678',
      clientEmail: 'marie@example.com',
    },
    {
      id: '3',
      service: 'Coupe + Coloration',
      price: 85,
      status: 'available',
      startDate: new Date(nextWeek.setHours(9, 0, 0)).toISOString(),
      endDate: new Date(nextWeek.setHours(11, 0, 0)).toISOString(),
      location: 'Salon de coiffure',
    },
  ];
};

// Mock service pour les slots
export const mockSlotsService = {
  // Récupérer tous les slots pour une période donnée
  getSlotsByDateRange: async (startDate: Date, endDate: Date): Promise<Slot[]> => {
    // Pour simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockSlots();
  },

  // Récupérer les slots disponibles uniquement
  getAvailableSlots: async (startDate: Date, endDate: Date): Promise<Slot[]> => {
    // Pour simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockSlots().filter(slot => slot.status === 'available');
  },

  // Réserver un créneau
  bookSlot: async (slotId: string, clientData: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
  }): Promise<boolean> => {
    // Pour simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Slot ${slotId} booked with data:`, clientData);
    return true;
  },

  // Créer un nouveau créneau
  createSlot: async (slotData: Omit<Slot, 'id' | 'createdAt' | 'updatedAt'>): Promise<Slot> => {
    // Pour simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    const newId = `slot-${Date.now()}`;
    console.log(`New slot created with id ${newId}:`, slotData);
    return { id: newId, ...slotData };
  },

  // Annuler un créneau
  cancelSlot: async (slotId: string): Promise<boolean> => {
    // Pour simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Slot ${slotId} cancelled`);
    return true;
  }
};