// services/slotsService.ts
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// Type pour les créneaux
export type Slot = {
  id?: string;
  startDate: string; // ISO string format
  endDate: string; // ISO string format
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  service?: string; // Type de service (coupe, coloration, etc.)
  status: 'available' | 'booked' | 'cancelled' | 'completed';
  location?: string; // Adresse ou lieu du rendez-vous
  price?: number;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

// Récupérer tous les créneaux pour une période donnée
export const getSlotsByDateRange = async (startDate: Date, endDate: Date) => {
  try {
    const slotsRef = collection(db, 'slots');
    
    // Convertir les dates en timestamps Firestore
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    // Requête pour récupérer les créneaux dans la période
    const q = query(
      slotsRef,
      where('startDate', '>=', startTimestamp),
      where('startDate', '<=', endTimestamp)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Transformer les documents Firestore en objets Slot
    const slots: Slot[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      slots.push({
        id: doc.id,
        startDate: data.startDate.toDate().toISOString(),
        endDate: data.endDate.toDate().toISOString(),
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail,
        service: data.service,
        status: data.status,
        location: data.location,
        price: data.price,
        notes: data.notes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });
    
    return slots;
  } catch (error) {
    console.error('Error getting slots:', error);
    throw error;
  }
};

// Récupérer les créneaux disponibles uniquement
export const getAvailableSlots = async (startDate: Date, endDate: Date) => {
  try {
    const slotsRef = collection(db, 'slots');
    
    // Convertir les dates en timestamps Firestore
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    // Requête pour récupérer les créneaux disponibles dans la période
    const q = query(
      slotsRef,
      where('startDate', '>=', startTimestamp),
      where('startDate', '<=', endTimestamp),
      where('status', '==', 'available')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Transformer les documents Firestore en objets Slot
    const slots: Slot[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      slots.push({
        id: doc.id,
        startDate: data.startDate.toDate().toISOString(),
        endDate: data.endDate.toDate().toISOString(),
        status: data.status,
        location: data.location,
        service: data.service,
        price: data.price
      });
    });
    
    return slots;
  } catch (error) {
    console.error('Error getting available slots:', error);
    throw error;
  }
};

// Réserver un créneau
export const bookSlot = async (slotId: string, clientData: {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}) => {
  try {
    const slotRef = doc(db, 'slots', slotId);
    await updateDoc(slotRef, {
      ...clientData,
      status: 'booked',
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error booking slot:', error);
    throw error;
  }
};

// Créer un nouveau créneau
export const createSlot = async (slotData: Omit<Slot, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Convertir les dates ISO en timestamps Firestore
    const startDate = new Date(slotData.startDate);
    const endDate = new Date(slotData.endDate);
    
    const newSlot = {
      ...slotData,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'slots'), newSlot);
    return { id: docRef.id, ...slotData };
  } catch (error) {
    console.error('Error creating slot:', error);
    throw error;
  }
};

// Annuler un créneau
export const cancelSlot = async (slotId: string) => {
  try {
    const slotRef = doc(db, 'slots', slotId);
    await updateDoc(slotRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling slot:', error);
    throw error;
  }
};