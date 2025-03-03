// app/event-details.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEvents } from '../context/EventsContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Phone, Mail, Trash2, Edit, ArrowLeft } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { getEventById, deleteEvent, loading } = useEvents();
  const [event, setEvent] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);

  useEffect(() => {
    if (id) {
      const eventData = getEventById(id.toString());
      if (eventData) {
        setEvent(eventData);
        
        // Extraire les informations client du titre
        // Format attendu: "Service - Nom du client"
        const parts = eventData.title.split(' - ');
        if (parts.length >= 2) {
          setClientInfo({
            name: parts[1],
            service: parts[0]
          });
        }
      }
    }
  }, [id, getEventById]);

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le rendez-vous',
      'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(id.toString());
              router.back();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le rendez-vous');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: '/edit-event',
      params: { id: id.toString() }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rendez-vous non trouvé</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Le rendez-vous demandé n'existe pas ou a été supprimé.</Text>
          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.backHomeButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  
  const formatDate = (date) => {
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };
  
  const formatTime = (date) => {
    return format(date, 'HH:mm', { locale: fr });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Détails du rendez-vous</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Edit size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash2 size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.colorBadge, { backgroundColor: event.color || COLORS.primary }]} />
        
        <View style={styles.serviceContainer}>
          <Text style={styles.serviceLabel}>Service</Text>
          <Text style={styles.serviceText}>{clientInfo?.service || 'Service non spécifié'}</Text>
        </View>
        
        {clientInfo?.name && (
          <View style={styles.clientContainer}>
            <Text style={styles.clientLabel}>Client</Text>
            <Text style={styles.clientName}>{clientInfo.name}</Text>
          </View>
        )}
        
        {event.description ? (
          <Text style={styles.description}>{event.description}</Text>
        ) : null}
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Calendar size={20} color={COLORS.gray} style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>{formatDate(startDate)}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={20} color={COLORS.gray} style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Heure</Text>
              <Text style={styles.detailText}>
                {formatTime(startDate)} - {formatTime(endDate)}
              </Text>
            </View>
          </View>
          
          {event.location ? (
            <View style={styles.detailItem}>
              <MapPin size={20} color={COLORS.gray} style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Lieu</Text>
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  backHomeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backHomeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  colorBadge: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  serviceContainer: {
    marginBottom: 16,
  },
  serviceLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  clientContainer: {
    marginBottom: 16,
  },
  clientLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 24,
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.dark,
  },
});