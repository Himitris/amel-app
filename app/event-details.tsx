import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEvents } from '../context/EventsContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Users, Bell, Trash2, CreditCard as Edit, ArrowLeft } from 'lucide-react-native';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { getEventById, deleteEvent } = useEvents();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (id) {
      const eventData = getEventById(id.toString());
      setEvent(eventData);
    }
  }, [id, getEventById]);

  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'événement',
      'Êtes-vous sûr de vouloir supprimer cet événement ?',
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
              Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
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

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Événement non trouvé</Text>
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
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Edit size={20} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash2 size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.colorBadge, { backgroundColor: event.color || '#007AFF' }]} />
        
        <Text style={styles.title}>{event.title}</Text>
        
        {event.description ? (
          <Text style={styles.description}>{event.description}</Text>
        ) : null}
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Calendar size={20} color="#8E8E93" style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>{formatDate(startDate)}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={20} color="#8E8E93" style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Heure</Text>
              <Text style={styles.detailText}>
                {formatTime(startDate)} - {formatTime(endDate)}
              </Text>
            </View>
          </View>
          
          {event.location ? (
            <View style={styles.detailItem}>
              <MapPin size={20} color="#8E8E93" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Lieu</Text>
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            </View>
          ) : null}
          
          {event.participants && event.participants.length > 0 ? (
            <View style={styles.detailItem}>
              <Users size={20} color="#8E8E93" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Participants</Text>
                <Text style={styles.detailText}>
                  {event.participants.length} participant{event.participants.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          ) : null}
          
          {event.reminder ? (
            <View style={styles.detailItem}>
              <Bell size={20} color="#8E8E93" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Rappel</Text>
                <Text style={styles.detailText}>
                  {event.reminderTime === 60 ? '1 heure' : `${event.reminderTime} minutes`} avant
                </Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 16,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#3A3A3C',
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
    color: '#8E8E93',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
});