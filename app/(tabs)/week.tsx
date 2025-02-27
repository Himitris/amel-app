import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEvents } from '../../context/EventsContext';
import { router } from 'expo-router';

export default function WeekScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const { events } = useEvents();

  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDays(days);
  }, [selectedDate]);

  const selectDay = (date) => {
    setSelectedDate(date);
  };

  const renderTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(
        <View key={hour} style={styles.timeSlot}>
          <Text style={styles.timeText}>{`${hour}:00`}</Text>
          <View style={styles.timeSlotLine} />
        </View>
      );
    }
    return slots;
  };

  const getEventPositionStyle = (event) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const startHour = startDate.getHours() + startDate.getMinutes() / 60;
    const endHour = endDate.getHours() + endDate.getMinutes() / 60;
    const duration = endHour - startHour;
    
    return {
      top: startHour * 60,
      height: duration * 60,
      backgroundColor: event.color || '#007AFF',
    };
  };

  const renderEvents = () => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, selectedDate);
    });

    return dayEvents.map(event => {
      const positionStyle = getEventPositionStyle(event);
      
      return (
        <TouchableOpacity
          key={event.id}
          style={[styles.event, positionStyle]}
          onPress={() => router.push({ pathname: '/event-details', params: { id: event.id } })}
        >
          <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
          {event.location && (
            <Text style={styles.eventLocation} numberOfLines={1}>{event.location}</Text>
          )}
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDayButton,
                isToday && styles.todayButton,
              ]}
              onPress={() => selectDay(day)}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.selectedDayText,
                isToday && styles.todayText,
              ]}>
                {format(day, 'EEE', { locale: fr })}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected && styles.selectedDayText,
                isToday && styles.todayText,
              ]}>
                {format(day, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </Text>
      </View>
      
      <ScrollView style={styles.timelineContainer}>
        <View style={styles.timeline}>
          <View style={styles.timeColumn}>
            {renderTimeSlots()}
          </View>
          
          <View style={styles.eventsColumn}>
            {renderEvents()}
          </View>
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
  weekDaysContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dayButton: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 12,
  },
  selectedDayButton: {
    backgroundColor: '#007AFF',
  },
  todayButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dayName: {
    fontSize: 14,
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  todayText: {
    color: '#007AFF',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  timelineContainer: {
    flex: 1,
  },
  timeline: {
    flexDirection: 'row',
    height: 24 * 60, // 24 hours * 60px per hour
  },
  timeColumn: {
    width: 60,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  timeSlot: {
    height: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  timeSlotLine: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 60,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  eventsColumn: {
    flex: 1,
    position: 'relative',
  },
  event: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 6,
    padding: 8,
    overflow: 'hidden',
  },
  eventTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  eventLocation: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
});