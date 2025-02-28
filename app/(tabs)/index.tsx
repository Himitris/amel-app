// app/(tabs)/index.tsx
import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Calendar as CalendarComponent, DateData } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router } from 'expo-router';
import { Clock, MapPin, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSlots } from '../../context/SlotsContext';
import AnimatedSlotCard from '../../components/AnimatedSlotCard';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function MonthScreen() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM yyyy', { locale: fr }));
  
  const { slots, loading, refreshSlots } = useSlots();
  
  useEffect(() => {
    if (slots) {
      const marked = {};
      slots.forEach(slot => {
        const eventDate = new Date(slot.startDate).toISOString().split('T')[0];
        
        // Définir les couleurs en fonction du statut
        let dotColor = COLORS.primary;
        if (slot.status === 'booked') dotColor = COLORS.secondary;
        if (slot.status === 'cancelled') dotColor = COLORS.gray;
        if (slot.status === 'completed') dotColor = COLORS.success;
        
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
  }, [slots, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };
  
  const onMonthChange = (month: DateData) => {
    setCurrentMonth(format(new Date(month.dateString), 'MMMM yyyy', { locale: fr }));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSlots();
    } finally {
      setRefreshing(false);
    }
  }, [refreshSlots]);

  const filteredSlots = slots.filter(slot => 
    new Date(slot.startDate).toISOString().split('T')[0] === selectedDate
  ).sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const renderSlot = ({ item, index }) => (
    <AnimatedSlotCard slot={item} index={index} />
  );

  const ListEmptyComponent = () => (
    <Animated.View 
      style={styles.noSlotsContainer}
      entering={FadeIn.delay(300)}
      exiting={FadeOut}
    >
      <Clock size={48} color={COLORS.veryLightGray} />
      <Text style={styles.noSlotsText}>Aucun créneau pour cette journée</Text>
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
      
      <View style={styles.slotsContainer}>
        <AnimatedFlatList
          data={filteredSlots}
          renderItem={renderSlot}
          keyExtractor={item => item.id || item.startDate}
          contentContainerStyle={styles.slotsList}
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
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/create-slot')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
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
  slotsContainer: {
    flex: 1,
    position: 'relative',
  },
  slotsList: {
    paddingBottom: 80,
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
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noSlotsText: {
    marginTop: 16,
    fontSize: SIZES.body,
    color: COLORS.gray,
    textAlign: 'center',
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