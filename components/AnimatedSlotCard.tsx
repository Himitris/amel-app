// components/AnimatedSlotCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, ZoomIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Clock, MapPin, Scissors, PiggyBank } from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { COLORS, SHADOWS } from '../constants/theme';
import { Slot } from '../services/slotsService';

type AnimatedSlotCardProps = {
  slot: Slot;
  index: number;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedSlotCard = ({ slot, index }: AnimatedSlotCardProps) => {
  const navigation = useNavigation();
  const scale = useSharedValue(1);
  
  const startTime = format(new Date(slot.startDate), 'HH:mm');
  const endTime = format(new Date(slot.endDate), 'HH:mm');
  const dateText = format(new Date(slot.startDate), 'EEEE d MMMM', { locale: fr });
  
  // Get background color based on status
  const getBackgroundColor = () => {
    switch(slot.status) {
      case 'available':
        return COLORS.accent;
      case 'booked':
        return COLORS.primaryLight;
      case 'cancelled':
        return COLORS.lightGray;
      case 'completed':
        return COLORS.success + '20'; // 20% opacity
      default:
        return COLORS.accent;
    }
  };
  
  // Get border color based on status
  const getBorderColor = () => {
    switch(slot.status) {
      case 'available':
        return COLORS.primary;
      case 'booked':
        return COLORS.secondary;
      case 'cancelled':
        return COLORS.gray;
      case 'completed':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };
  
  // Animated styles for the card
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  // Handle press
  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    
    navigation.navigate('SlotDetails', { slotId: slot.id });
  };

  return (
    <AnimatedTouchable 
      style={[
        styles.container, 
        { 
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
        },
        animatedStyle
      ]}
      onPress={handlePress}
      entering={FadeInDown.delay(index * 100).springify()}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{startTime}</Text>
        <Text style={styles.timeSeparator}>-</Text>
        <Text style={styles.timeText}>{endTime}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Animated.View entering={ZoomIn.delay(index * 100 + 300)}>
            <Scissors size={16} color={COLORS.primary} />
          </Animated.View>
          <Text style={styles.serviceText}>{slot.service || 'Service non spécifié'}</Text>
        </View>
        
        <View style={styles.details}>
          {slot.location && (
            <View style={styles.detailItem}>
              <MapPin size={14} color={COLORS.gray} />
              <Text style={styles.detailText}>{slot.location}</Text>
            </View>
          )}
          
          {slot.price && (
            <View style={styles.detailItem}>
              <PiggyBank size={14} color={COLORS.gray} />
              <Text style={styles.detailText}>{slot.price} €</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Clock size={14} color={COLORS.gray} />
            <Text style={styles.detailText}>{dateText}</Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getBorderColor() }]}>
            <Text style={styles.statusText}>
              {slot.status === 'available' ? 'Disponible' : 
               slot.status === 'booked' ? 'Réservé' :
               slot.status === 'cancelled' ? 'Annulé' : 'Terminé'}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  timeContainer: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  timeSeparator: {
    fontSize: 14,
    color: COLORS.gray,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: 8,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.background,
  },
});

export default AnimatedSlotCard;