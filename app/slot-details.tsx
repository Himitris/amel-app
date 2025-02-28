// app/slot-details.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeInLeft, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, 
  Scissors, PiggyBank, FileText, Bell, Trash2, 
  Edit, ArrowLeft, CheckCircle, XCircle 
} from 'lucide-react-native';
import { useSlots } from '../context/SlotsContext';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';

export default function SlotDetailsScreen() {
  const { slotId } = useLocalSearchParams();
  const router = useRouter();
  const { getSlotById, bookAppointment, cancelAppointment, loading } = useSlots();
  const [slot, setSlot] = useState(null);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (slotId) {
      const slotData = getSlotById(slotId.toString());
      setSlot(slotData);
      
      // Animate header
      headerOpacity.value = withSpring(1, { damping: 20 });
    }
  }, [slotId, getSlotById]);

  const handleCancelSlot = () => {
    Alert.alert(
      'Annuler le créneau',
      'Êtes-vous sûr de vouloir annuler ce créneau ?',
      [
        {
          text: 'Non',
          style: 'cancel',
        },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAppointment(slotId.toString());
              // Refresh slot data
              setSlot(getSlotById(slotId.toString()));
              Alert.alert('Succès', 'Le créneau a été annulé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler le créneau');
            }
          },
        },
      ]
    );
  };

  const handleBookSlot = () => {
    // Ici on pourrait ouvrir un formulaire pour saisir les infos client
    // Pour l'exemple, on utilise des valeurs fictives
    Alert.alert(
      'Réserver ce créneau',
      'Voulez-vous réserver ce créneau ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Réserver',
          onPress: async () => {
            try {
              await bookAppointment(slotId.toString(), {
                clientName: 'Client Test',
                clientPhone: '0612345678',
                clientEmail: 'client@example.com',
              });
              // Refresh slot data
              setSlot(getSlotById(slotId.toString()));
              Alert.alert('Succès', 'Le créneau a été réservé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de réserver le créneau');
            }
          },
        },
      ]
    );
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: withSpring(headerOpacity.value * 0 + (1 - headerOpacity.value) * -50) }]
    };
  });
  
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });
  
  const onButtonPress = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
  };

  if (!slot) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const startDate = parseISO(slot.startDate);
  const endDate = parseISO(slot.endDate);
  
  const formatDate = (date) => {
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };
  
  const formatTime = (date) => {
    return format(date, 'HH:mm', { locale: fr });
  };
  
  // Get background color based on status
  const getStatusColor = () => {
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

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.header, headerAnimatedStyle, { backgroundColor: getStatusColor() }]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.background} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {slot.status === 'available' ? 'Créneau Disponible' : 
           slot.status === 'booked' ? 'Rendez-vous Confirmé' :
           slot.status === 'cancelled' ? 'Créneau Annulé' : 'Rendez-vous Terminé'}
        </Text>
        
        <View style={styles.serviceIconContainer}>
          <Scissors size={28} color={COLORS.background} />
        </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={styles.serviceContainer}
          entering={FadeInDown.delay(300).springify()}
        >
          <Text style={styles.serviceLabel}>Service</Text>
          <Text style={styles.serviceText}>{slot.service || 'Service non spécifié'}</Text>
          
          {slot.price && (
            <View style={styles.priceContainer}>
              <PiggyBank size={16} color={COLORS.primary} />
              <Text style={styles.priceText}>{slot.price} €</Text>
            </View>
          )}
        </Animated.View>
        
        <View style={styles.detailsContainer}>
          <Animated.View 
            style={styles.detailItem}
            entering={FadeInLeft.delay(400).springify()}
          >
            <Calendar size={20} color={COLORS.primary} style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>{formatDate(startDate)}</Text>
            </View>
          </Animated.View>
          
          <Animated.View 
            style={styles.detailItem}
            entering={FadeInRight.delay(500).springify()}
          >
            <Clock size={20} color={COLORS.primary} style={styles.detailIcon} />
            <View>
              <Text style={styles.detailLabel}>Heure</Text>
              <Text style={styles.detailText}>
                {formatTime(startDate)} - {formatTime(endDate)}
              </Text>
            </View>
          </Animated.View>
          
          {slot.location && (
            <Animated.View 
              style={styles.detailItem}
              entering={FadeInLeft.delay(600).springify()}
            >
              <MapPin size={20} color={COLORS.primary} style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Lieu</Text>
                <Text style={styles.detailText}>{slot.location}</Text>
              </View>
            </Animated.View>
          )}
        </View>
        
        {/* Afficher les informations client si le créneau est réservé */}
        {slot.status === 'booked' && slot.clientName && (
          <Animated.View 
            style={styles.clientContainer}
            entering={FadeIn.delay(700).springify()}
          >
            <Text style={styles.sectionTitle}>Informations client</Text>
            
            <View style={styles.clientInfo}>
              <View style={styles.clientInfoItem}>
                <User size={18} color={COLORS.primary} style={styles.clientInfoIcon} />
                <Text style={styles.clientInfoText}>{slot.clientName}</Text>
              </View>
              
              {slot.clientPhone && (
                <TouchableOpacity style={styles.clientInfoItem}>
                  <Phone size={18} color={COLORS.primary} style={styles.clientInfoIcon} />
                  <Text style={styles.clientInfoText}>{slot.clientPhone}</Text>
                </TouchableOpacity>
              )}
              
              {slot.clientEmail && (
                <TouchableOpacity style={styles.clientInfoItem}>
                  <Mail size={18} color={COLORS.primary} style={styles.clientInfoIcon} />
                  <Text style={styles.clientInfoText}>{slot.clientEmail}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
        
        {slot.notes && (
          <Animated.View 
            style={styles.notesContainer}
            entering={FadeIn.delay(800).springify()}
          >
            <View style={styles.notesHeader}>
              <FileText size={18} color={COLORS.gray} />
              <Text style={styles.notesTitle}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{slot.notes}</Text>
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Boutons d'action selon le statut */}
      <View style={styles.actionsContainer}>
        {slot.status === 'available' && (
          <Animated.View
            entering={FadeInDown.delay(900).springify()}
            style={[buttonAnimatedStyle, { width: '100%' }]}
          >
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={() => {
                onButtonPress();
                handleBookSlot();
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <CheckCircle size={20} color={COLORS.background} />
                  <Text style={styles.actionButtonText}>Réserver ce créneau</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {slot.status === 'booked' && (
          <Animated.View
            entering={FadeInDown.delay(900).springify()}
            style={[buttonAnimatedStyle, { width: '100%' }]}
          >
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.error }]}
              onPress={() => {
                onButtonPress();
                handleCancelSlot();
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <XCircle size={20} color={COLORS.background} />
                  <Text style={styles.actionButtonText}>Annuler ce rendez-vous</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.gray,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...SHADOWS.medium,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.background,
    marginTop: 10,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  serviceContainer: {
    backgroundColor: COLORS.accent + '40', // 40% opacity
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
  },
  serviceLabel: {
    fontSize: SIZES.caption,
    color: COLORS.gray,
    marginBottom: 4,
  },
  serviceText: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  detailsContainer: {
    marginVertical: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    ...SHADOWS.small,
  },
  detailIcon: {
    marginRight: 16,
  },
  detailLabel: {
    fontSize: SIZES.caption,
    color: COLORS.gray,
    marginBottom: 4,
  },
  detailText: {
    fontSize: SIZES.body,
    color: COLORS.dark,
    fontWeight: '500',
  },
  clientContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.title,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 16,
  },
  clientInfo: {
    marginTop: 8,
  },
  clientInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.veryLightGray,
  },
  clientInfoIcon: {
    marginRight: 12,
  },
  clientInfoText: {
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  notesContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    ...SHADOWS.small,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: 8,
  },
  notesText: {
    fontSize: SIZES.body,
    color: COLORS.darkGray,
    lineHeight: 24,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.veryLightGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    ...SHADOWS.medium,
  },
  actionButtonText: {
    color: COLORS.background,
    fontSize: SIZES.body,
    fontWeight: '600',
    marginLeft: 8,
  },
});