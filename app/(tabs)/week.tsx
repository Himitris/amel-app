// app/(tabs)/week.tsx
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEvents } from '../../context/EventsContext';
import { router } from 'expo-router';
import {
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

export default function WeekScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const { events, refreshEvents } = useEvents();
  const timelineScrollRef = useRef(null);

  // Actualiser les événements lors du montage du composant
  useEffect(() => {
    const loadEvents = async () => {
      try {
        await refreshEvents();
        console.log("Événements actualisés!");
      } catch (error) {
        console.error("Erreur lors de l'actualisation des événements:", error);
      }
    };

    loadEvents();
  }, []);

  // Déclencher le défilement lorsque la date sélectionnée change ou quand les événements sont chargés
  useEffect(() => {
    // Un petit délai pour s'assurer que la vue est bien rendue
    const timer = setTimeout(() => {
      scrollToFirstEvent();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedDate, events]);

  useEffect(() => {
    // Démarrer la semaine à partir d'aujourd'hui au lieu du lundi
    const today = new Date();
    const days = [];

    // Générer 7 jours à partir d'aujourd'hui
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      days.push(day);
    }

    setWeekDays(days);

    // Si aucune date n'est sélectionnée, sélectionner aujourd'hui
    if (!selectedDate) {
      setSelectedDate(today);
    }
  }, []); // Dépendance vide pour n'exécuter qu'au montage initial

  const selectDay = (date) => {
    console.log("Jour sélectionné:", date.toISOString());
    setSelectedDate(date);
    // Le défilement sera automatiquement déclenché par l'effet qui surveille selectedDate
  };

  // Fonction pour réinitialiser la vue de la semaine à aujourd'hui
  const resetToToday = () => {
    const today = new Date();
    setSelectedDate(today);

    // Régénérer la semaine à partir d'aujourd'hui
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  };

  // Fonction pour naviguer vers la semaine précédente
  const goToPreviousWeek = () => {
    if (weekDays.length > 0) {
      const firstDay = new Date(weekDays[0]);
      // Reculer de 7 jours par rapport au premier jour de la semaine actuelle
      firstDay.setDate(firstDay.getDate() - 7);

      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(firstDay);
        day.setDate(firstDay.getDate() + i);
        days.push(day);
      }

      setWeekDays(days);
      // Ne pas changer la date sélectionnée pour éviter de réinitialiser la vue
    }
  };

  // Fonction pour naviguer vers la semaine suivante
  const goToNextWeek = () => {
    if (weekDays.length > 0) {
      const firstDay = new Date(weekDays[0]);
      // Avancer de 7 jours par rapport au premier jour de la semaine actuelle
      firstDay.setDate(firstDay.getDate() + 7);

      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(firstDay);
        day.setDate(firstDay.getDate() + i);
        days.push(day);
      }

      setWeekDays(days);
      // Ne pas changer la date sélectionnée pour éviter de réinitialiser la vue
    }
  };

  const renderTimeSlots = () => {
    const slots = [];
    // Commencer à 7h au lieu de 0h
    for (let hour = 7; hour < 24; hour++) {
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

    // Ajuster la position top pour commencer à 7h
    const adjustedStartHour = Math.max(startHour - 7, 0); // Si l'événement commence avant 7h, l'afficher à 0

    return {
      top: adjustedStartHour * 60,
      height: duration * 60,
      backgroundColor: event.color || '#007AFF',
    };
  };

  const renderEvents = () => {
    // Assurons-nous que tous les événements sont bien récupérés
    console.log("Tous les événements disponibles:", events.length);

    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      const isMatchingDay = isSameDay(eventDate, selectedDate);
      return isMatchingDay;
    });

    console.log("Événements pour le jour sélectionné:", dayEvents.length, "Date sélectionnée:", selectedDate.toISOString());

    if (dayEvents.length === 0) {
      // Optionnellement, ajouter un message "Aucun événement"
      return null;
    }

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

  // Fonction pour défiler jusqu'à l'heure du premier événement ou l'heure par défaut (7h)
  const scrollToFirstEvent = () => {
    if (!timelineScrollRef.current) return;

    // Filtrer les événements du jour sélectionné
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, selectedDate);
    });

    // Trier les événements par heure de début
    dayEvents.sort((a, b) => {
      const timeA = new Date(a.startDate).getHours();
      const timeB = new Date(b.startDate).getHours();
      return timeA - timeB;
    });

    // Déterminer à quelle heure défiler
    let scrollHour = 7; // Par défaut, 7h

    // S'il y a des événements, prendre l'heure du premier
    if (dayEvents.length > 0) {
      const firstEventDate = new Date(dayEvents[0].startDate);
      scrollHour = firstEventDate.getHours();
      // Si l'événement est avant 7h, on reste à 7h
      if (scrollHour < 7) scrollHour = 7;
    }

    // Calculer la position de défilement (heure * hauteur d'une heure)
    const scrollPosition = (scrollHour - 7) * 60; // 60px par heure, en commençant à 7h

    // Effectuer le défilement
    timelineScrollRef.current.scrollTo({ y: scrollPosition, animated: true });
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const dayName = format(day, 'EEE', { locale: fr });
          const dayNumber = format(day, 'd');

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDayButton,
                isCurrentDay && styles.todayButton,
              ]}
              onPress={() => selectDay(day)}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.selectedDayText,
                isCurrentDay && styles.todayText,
              ]}>
                {dayName}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected && styles.selectedDayText,
                isCurrentDay && styles.todayText,
              ]}>
                {dayNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.headerContainer}>
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPreviousWeek}
          >
            <ChevronLeft size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.todayButton}
            onPress={resetToToday}
          >
            <Text style={styles.todayButtonText}>Aujourd'hui</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNextWeek}
          >
            <ChevronRight size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerText}>
          {weekDays.length > 0 ? (
            `${format(weekDays[0], 'd MMM', { locale: fr })} - ${format(weekDays[weekDays.length - 1], 'd MMM yyyy', { locale: fr })}`
          ) : (
            format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })
          )}
        </Text>
      </View>

      <ScrollView
        ref={timelineScrollRef}
        style={styles.timelineContainer}
      >
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    marginHorizontal: 12,
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
    color: '#000000',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    textTransform: 'capitalize',
    textAlign: 'center',
    marginTop: 8,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContainer: {
    flex: 1,
  },
  timeline: {
    flexDirection: 'row',
    height: 17 * 60, // 17 hours (7h-24h) * 60px per hour
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