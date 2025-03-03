// app/(tabs)/agenda.tsx
import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEvents } from '../../context/EventsContext';
import { router } from 'expo-router';
import { Clock, MapPin, CalendarIcon, Scissors } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

export default function AgendaScreen() {
  const [sections, setSections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { events, loading, refreshEvents } = useEvents();

  useEffect(() => {
    if (events) {
      organizeSectionsByDate();
    }
  }, [events]);

  const organizeSectionsByDate = () => {
    const today = [];
    const tomorrow = [];
    const thisWeek = [];
    const thisMonth = [];
    const later = [];

    events.forEach(event => {
      const eventDate = parseISO(event.startDate);
      
      if (isToday(eventDate)) {
        today.push(event);
      } else if (isTomorrow(eventDate)) {
        tomorrow.push(event);
      } else if (isThisWeek(eventDate)) {
        thisWeek.push(event);
      } else if (isThisMonth(eventDate)) {
        thisMonth.push(event);
      } else {
        later.push(event);
      }
    });

    const sortByDate = (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    
    const newSections = [
      { title: 'Aujourd\'hui', data: today.sort(sortByDate) },
      { title: 'Demain', data: tomorrow.sort(sortByDate) },
      { title: 'Cette semaine', data: thisWeek.sort(sortByDate) },
      { title: 'Ce mois-ci', data: thisMonth.sort(sortByDate) },
      { title: 'Plus tard', data: later.sort(sortByDate) },
    ].filter(section => section.data.length > 0);

    setSections(newSections);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshEvents();
    } finally {
      setRefreshing(false);
    }
  }, [refreshEvents]);

  const renderEvent = ({ item }) => {
    const startTime = format(new Date(item.startDate), 'HH:mm');
    const endTime = format(new Date(item.endDate), 'HH:mm');
    const eventDate = format(new Date(item.startDate), 'EEEE d MMMM', { locale: fr });
    
    // Déterminer les éléments visuels selon le type d'événement
    const isPersonal = item.eventType === 'personal';
    const eventColor = item.color || (isPersonal ? COLORS.secondary : COLORS.primary);
    
    return (
      <TouchableOpacity 
        style={[styles.eventCard, { borderLeftColor: eventColor }]}
        onPress={() => router.push({ pathname: '/event-details', params: { id: item.id } })}
      >
        <View style={styles.eventTimeContainer}>
          <Text style={styles.eventTime}>{startTime}</Text>
          <Text style={styles.eventTimeSeparator}>-</Text>
          <Text style={styles.eventTime}>{endTime}</Text>
        </View>
        
        <View style={styles.eventContent}>
          <View style={styles.eventTitleContainer}>
            {isPersonal ? (
              // Icône pour événement personnel
              <View style={[styles.eventTypeIndicator, { backgroundColor: COLORS.secondary }]}>
                <HomeIcon size={12} color="#FFFFFF" />
              </View>
            ) : (
              // Icône pour événement professionnel
              <View style={[styles.eventTypeIndicator, { backgroundColor: COLORS.primary }]}>
                <Briefcase size={12} color="#FFFFFF" />
              </View>
            )}
            <Text style={styles.eventTitle}>{item.title}</Text>
          </View>
          
          {item.description ? (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          
          <View style={styles.eventDetails}>
            {item.location ? (
              <View style={styles.eventDetailItem}>
                <MapPin size={14} color="#8E8E93" />
                <Text style={styles.eventDetailText}>{item.location}</Text>
              </View>
            ) : null}
            
            <View style={styles.eventDetailItem}>
              <Clock size={14} color="#8E8E93" />
              <Text style={styles.eventDetailText}>{eventDate}</Text>
            </View>
            
            {/* Afficher les informations spécifiques aux événements professionnels */}
            {!isPersonal && item.service && (
              <View style={styles.eventDetailItem}>
                <Scissors size={14} color="#8E8E93" />
                <Text style={styles.eventDetailText}>{item.service}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  if (loading && !refreshing && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des rendez-vous...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sections.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Clock size={48} color="#C7C7CC" />
          <Text style={styles.noEventsText}>Aucun rendez-vous à venir</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderEvent}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.eventsList}
          stickySectionHeadersEnabled={true}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[COLORS.primary]} 
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noEventsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  eventsList: {
    paddingBottom: 16,
  },
  sectionHeader: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  eventTimeContainer: {
    marginRight: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  eventTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  eventTimeSeparator: {
    fontSize: 14,
    color: '#C7C7CC',
    marginVertical: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#3A3A3C',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTypeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});