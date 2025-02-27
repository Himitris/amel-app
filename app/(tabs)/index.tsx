import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Calendar as CalendarComponent, DateData } from 'react-native-calendars';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEvents } from '../../context/EventsContext';
import { router } from 'expo-router';
import { Clock, MapPin } from 'lucide-react-native';

export default function MonthScreen() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [markedDates, setMarkedDates] = useState({});
  const { events, loading } = useEvents();
  
  useEffect(() => {
    if (events) {
      const marked = {};
      events.forEach(event => {
        const eventDate = event.startDate.split('T')[0];
        if (marked[eventDate]) {
          marked[eventDate].dots.push({ color: event.color || '#007AFF' });
        } else {
          marked[eventDate] = {
            dots: [{ color: event.color || '#007AFF' }],
          };
        }
      });
      
      // Add selected date marker
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#007AFF',
      };
      
      setMarkedDates(marked);
    }
  }, [events, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const filteredEvents = events.filter(event => 
    event.startDate.startsWith(selectedDate)
  ).sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const renderEvent = ({ item }) => {
    const startTime = new Date(item.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(item.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <TouchableOpacity 
        style={[styles.eventCard, { borderLeftColor: item.color || '#007AFF' }]}
        onPress={() => router.push({ pathname: '/event-details', params: { id: item.id } })}
      >
        <View style={styles.eventTimeContainer}>
          <Text style={styles.eventTime}>{startTime}</Text>
          <Text style={styles.eventTimeSeparator}>-</Text>
          <Text style={styles.eventTime}>{endTime}</Text>
        </View>
        
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          
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
            
            {item.participants && item.participants.length > 0 ? (
              <View style={styles.eventDetailItem}>
                <Text style={styles.eventDetailText}>
                  {item.participants.length} participant{item.participants.length > 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CalendarComponent
        current={selectedDate}
        onDayPress={onDayPress}
        markingType={'multi-dot'}
        markedDates={markedDates}
        theme={{
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: '#8E8E93',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#007AFF',
          dayTextColor: '#1C1C1E',
          textDisabledColor: '#C7C7CC',
          dotColor: '#007AFF',
          selectedDotColor: '#FFFFFF',
          arrowColor: '#007AFF',
          monthTextColor: '#1C1C1E',
          indicatorColor: '#007AFF',
        }}
      />
      
      <View style={styles.eventsContainer}>
        <Text style={styles.dateHeader}>
          {format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })}
        </Text>
        
        {filteredEvents.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Clock size={48} color="#C7C7CC" />
            <Text style={styles.noEventsText}>Aucun événement pour cette journée</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            renderItem={renderEvent}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.eventsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  eventsList: {
    paddingBottom: 16,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 4,
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
});