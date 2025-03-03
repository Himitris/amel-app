// app/(tabs)/index.tsx
import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Calendar as CalendarComponent, DateData } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router } from 'expo-router';
import { Clock, MapPin, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useEvents } from '../../context/EventsContext'; // Maintenant nous utilisons useEvents au lieu de useSlots

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function MonthScreen() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM yyyy', { locale: fr }));
  
  const { events, loading, refreshEvents } = useEvents();
  
  useEffect(() => {
    if (events) {
      const marked = {};
      events.forEach(event => {
        const eventDate = new Date(event.startDate).toISOString().split('T')[0];
        
        // Définir les couleurs en fonction du service (extrait du titre)
        let dotColor = COLORS.primary;
        const title = event.title.toLowerCase();
        
        if (title.includes('coloration')) dotColor = '#FF9500';
        if (title.includes('coupe')) dotColor = '#34C759';
        if (title.includes('coiffage')) dotColor = '#5856D6';
        if (title.includes('soin')) dotColor = '#FF2D55';
        
        if (marked[eventDate]) {
          marked[eventDate].dots.push({ color: dotColor });
        } else {
          marked[eventDate] = {
            dots: [{ color: dotColor }],
          };
        }
      });
      
      // Add selected date marker
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: COLORS.primary,
      };
      
      setMarkedDates(marked);
    }
  }, [events, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };
  
  const onMonthChange = (month: DateData) => {
    setCurrentMonth(format(new Date(month.dateString), 'MMMM yyyy', { locale: fr }));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshEvents();
    } finally {
      setRefreshing(false);
    }
  }, [refreshEvents]);

  // Filtrer les événements pour la date sélectionnée
  const filteredEvents = events.filter(event => 
    new Date(event.startDate).toISOString().split('T')[0] === selectedDate
  ).sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const renderEvent = ({ item, index }) => {
    const startTime = format(new Date(item.startDate), 'HH:mm');
    const endTime = format(new Date(item.endDate), 'HH:mm');
    
    return (
      <Animated.View
        style={[styles.eventCard, { borderLeftColor: item.color || COLORS.primary }]}
        entering={FadeIn.delay(index * 100).springify()}
        layout={Layout.springify()}
      >
        <TouchableOpacity 
          style={styles.eventCardInner}
          onPress={() => router.push({ pathname: '/event-details', params: { id: item.id } })}
        >
          <View style={styles.eventTimeContainer}>
            <Text style={styles.eventTime}>{startTime}</Text>
            <Text style={styles.eventTimeSeparator}>—</Text>
            <Text style={styles.eventTime}>{endTime}</Text>
          </View>
          
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            
            {item.location ? (
              <View style={styles.eventDetail}>
                <MapPin size={14} color={COLORS.gray} />
                <Text style={styles.eventDetailText}>{item.location}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ListEmptyComponent = () => (
    <Animated.View 
      style={styles.noEventsContainer}
      entering={FadeIn.delay(300)}
      exiting={FadeOut}
    >
      <Clock size={48} color={COLORS.veryLightGray} />
      <Text style={styles.noEventsText}>Aucun rendez-vous pour cette journée</Text>
    </Animated.View>
  );

  const ListHeaderComponent = () => (
    <Animated.View 
      style={styles.calendarHeader}
      entering={FadeIn}
      layout={Layout.springify()}
    >
      <CalendarIcon size={20} color={COLORS.primary} />
      <Text style={styles.dateHeader}>
        {format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })}
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <Text style={styles.monthTitle}>{currentMonth}</Text>
      </View>
      
      <CalendarComponent
        current={selectedDate}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markingType={'multi-dot'}
        markedDates={markedDates}
        theme={{
          calendarBackground: COLORS.background,
          textSectionTitleColor: COLORS.gray,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: COLORS.background,
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.dark,
          textDisabledColor: COLORS.lightGray,
          dotColor: COLORS.primary,
          selectedDotColor: COLORS.background,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.dark,
          indicatorColor: COLORS.primary,
          textDayFontFamily: FONTS.regular.fontFamily,
          textMonthFontFamily: FONTS.semiBold.fontFamily,
          textDayHeaderFontFamily: FONTS.medium.fontFamily,
        }}
        renderArrow={(direction) => (
          direction === 'left' 
            ? <ChevronLeft size={20} color={COLORS.primary} /> 
            : <ChevronRight size={20} color={COLORS.primary} />
        )}
      />
      
      <View style={styles.eventsContainer}>
        {loading && !refreshing && events.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des rendez-vous...</Text>
          </View>
        ) : (
          <AnimatedFlatList
            data={filteredEvents}
            renderItem={renderEvent}
            keyExtractor={item => item.id || item.startDate}
            contentContainerStyle={styles.eventsList}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[COLORS.primary]} 
                tintColor={COLORS.primary}
              />
            }
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            showsVerticalScrollIndicator={false}
            itemLayoutAnimation={Layout.springify()}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  monthHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.veryLightGray,
    ...SHADOWS.small,
  },
  monthTitle: {
    fontSize: SIZES.title,
    fontWeight: '600',
    color: COLORS.dark,
    textTransform: 'capitalize',
  },
  eventsContainer: {
    flex: 1,
    position: 'relative',
  },
  eventsList: {
    paddingBottom: 80,
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
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateHeader: {
    fontSize: SIZES.title,
    fontWeight: '600',
    marginLeft: 8,
    color: COLORS.dark,
    textTransform: 'capitalize',
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noEventsText: {
    marginTop: 16,
    fontSize: SIZES.body,
    color: COLORS.gray,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  eventCardInner: {
    flexDirection: 'row',
    padding: 12,
  },
  eventTimeContainer: {
    marginRight: 12,
    alignItems: 'center',
    minWidth: 50,
  },
  eventTime: {
    fontSize: 14,
    color: COLORS.gray,
  },
  eventTimeSeparator: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginVertical: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.background,
  },
});