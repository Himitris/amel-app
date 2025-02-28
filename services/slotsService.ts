// services/slotsService.ts
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { mockSlotsService } from './mockFirebase';

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
  createdAt?: any;
  updatedAt?: any;
};

// Vérifier si Firebase est configuré
const isFirebaseConfigured = () => {
  try {
    return !!db;
  } catch (error) {
    console.warn('Firebase not configured, using mock data');
    return false;
  }
};

// Récupérer tous les créneaux pour une période donnée
export const getSlotsByDateRange = async (startDate: Date, endDate: Date) => {
  // Si Firebase n'est pas configuré, utiliser les données mockées
  if (!isFirebaseConfigured()) {
    return mockSlotsService.getSlotsByDateRange(startDate, endDate);
  }

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
    // En cas d'erreur, utiliser les données mockées comme fallback
    return mockSlotsService.getSlotsByDateRange(startDate, endDate);
  }
};

// Récupérer les créneaux disponibles uniquement
export const getAvailableSlots = async (startDate: Date, endDate: Date) => {
  // Si Firebase n'est pas configuré, utiliser les données mockées
  if (!isFirebaseConfigured()) {
    return mockSlotsService.getAvailableSlots(startDate, endDate);
  }

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
    // En cas d'erreur, utiliser les données mockées comme fallback
    return mockSlotsService.getAvailableSlots(startDate, endDate);
  }
};

// Réserver un créneau
export const bookSlot = async (slotId: string, clientData: {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}) => {
  // Si Firebase n'est pas configuré, utiliser les données mockées
  if (!isFirebaseConfigured()) {
    return mockSlotsService.bookSlot(slotId, clientData);
  }

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
    // En cas d'erreur, utiliser les données mockées comme fallback
    return mockSlotsService.bookSlot(slotId, clientData);
  }
};

// Créer un nouveau créneau
export const createSlot = async (slotData: Omit<Slot, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Si Firebase n'est pas configuré, utiliser les données mockées
  if (!isFirebaseConfigured()) {
    return mockSlotsService.createSlot(slotData);
  }

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
    // En cas d'erreur, utiliser les données mockées comme fallback
    return mockSlotsService.createSlot(slotData);
  }
};

// Annuler un créneau
export const cancelSlot = async (slotId: string) => {
  // Si Firebase n'est pas configuré, utiliser les données mockées
  if (!isFirebaseConfigured()) {
    return mockSlotsService.cancelSlot(slotId);
  }

  try {
    const slotRef = doc(db, 'slots', slotId);
    await updateDoc(slotRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling slot:', error);
    // En cas d'erreur, utiliser les données mockées comme fallback
    return mockSlotsService.cancelSlot(slotId);
  }
};