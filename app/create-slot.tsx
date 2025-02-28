// app/create-slot.tsx
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { 
  Calendar, Clock, MapPin, Scissors, PiggyBank, 
  FileText, ArrowLeft, CheckCircle
} from 'lucide-react-native';
import { useSlots } from '../context/SlotsContext';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';

// Liste des services proposés
const SERVICES = [
  { id: 'cut', name: 'Coupe', price: 35 },
  { id: 'color', name: 'Coloration', price: 60 },
  { id: 'cut_color', name: 'Coupe + Coloration', price: 85 },
  { id: 'styling', name: 'Coiffage', price: 30 },
  { id: 'treatment', name: 'Soin', price: 25 },
];

export default function CreateSlotScreen() {
  const router = useRouter();
  const { createNewSlot, loading } = useSlots();
  
  // States pour les champs du formulaire
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  // States pour les pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleCreateSlot = async () => {
    if (!selectedService) {
      Alert.alert('Erreur', 'Veuillez sélectionner un service');
      return;
    }
    
    if (endDate <= startDate) {
      Alert.alert('Erreur', 'La date de fin doit être après la date de début');
      return;
    }
    
    try {
      const serviceObj = SERVICES.find(s => s.id === selectedService);
      
      await createNewSlot({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        service: serviceObj?.name,
        price: serviceObj?.price || parseFloat(price),
        location,
        notes,
        status: 'available',
      });
      
      Alert.alert('Succès', 'Le créneau a été créé', [
        {
          text: 'OK',
          onPress: () => router.back(),
        }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le créneau');
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: fr });
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    
    // Keep the time from the previous startDate
    const newDate = new Date(currentDate);
    newDate.setHours(startDate.getHours(), startDate.getMinutes());
    
    setStartDate(newDate);
    
    // If end date is before start date, update it
    if (endDate < newDate) {
      const newEndDate = new Date(newDate);
      newEndDate.setHours(newDate.getHours() + 1);
      setEndDate(newEndDate);
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startDate;
    setShowStartTimePicker(Platform.OS === 'ios');
    
    // Keep the date from the previous startDate
    const newDate = new Date(startDate);
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    
    setStartDate(newDate);
    
    // If end time is before start time on the same day, update it
    if (endDate.getDate() === newDate.getDate() && 
        endDate.getMonth() === newDate.getMonth() && 
        endDate.getFullYear() === newDate.getFullYear() && 
        endDate < newDate) {
      const newEndDate = new Date(newDate);
      newEndDate.setHours(newDate.getHours() + 1);
      setEndDate(newEndDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    
    // Keep the time from the previous endDate
    const newDate = new Date(currentDate);
    newDate.setHours(endDate.getHours(), endDate.getMinutes());
    
    // If end date is before start date, don't update
    if (newDate < startDate) {
      return;
    }
    
    setEndDate(newDate);
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endDate;
    setShowEndTimePicker(Platform.OS === 'ios');
    
    // Keep the date from the previous endDate
    const newDate = new Date(endDate);
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    
    // If end time is before start time on the same day, don't update
    if (newDate.getDate() === startDate.getDate() && 
        newDate.getMonth() === startDate.getMonth() && 
        newDate.getFullYear() === startDate.getFullYear() && 
        newDate < startDate) {
      return;
    }
    
    setEndDate(newDate);
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
        <Text style={styles.headerTitle}>Créer un créneau</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Service */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(200).springify()}
        >
          <Text style={styles.sectionTitle}>
            <Scissors size={18} color={COLORS.primary} style={styles.sectionIcon} />
            Service
          </Text>
          
          <View style={styles.serviceOptions}>
            {SERVICES.map((service) => (
              <TouchableOpacity 
                key={service.id}
                style={[
                  styles.serviceOption,
                  selectedService === service.id && { 
                    backgroundColor: COLORS.primary,
                    borderColor: COLORS.primary 
                  }
                ]}
                onPress={() => {
                  setSelectedService(service.id);
                  setPrice(service.price.toString());
                }}
              >
                <Text style={[
                  styles.serviceOptionText,
                  selectedService === service.id && { color: COLORS.background }
                ]}>
                  {service.name}
                </Text>
                <Text style={[
                  styles.serviceOptionPrice,
                  selectedService === service.id && { color: COLORS.background }
                ]}>
                  {service.price} €
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Prix</Text>
            <View style={styles.priceInputContainer}>
              <PiggyBank size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.priceInput}
                value={price}
                onChangeText={setPrice}
                placeholder="Prix du service"
                keyboardType="numeric"
              />
              <Text style={styles.priceCurrency}>€</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Section Date et Heure */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(300).springify()}
        >
          <Text style={styles.sectionTitle}>
            <Calendar size={18} color={COLORS.primary} style={styles.sectionIcon} />
            Date et Heure
          </Text>
          
          <View style={styles.dateTimeSection}>
            <Animated.View entering={FadeInLeft.delay(400)}>
              <Text style={styles.dateTimeLabel}>Début</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Calendar size={20} color={COLORS.gray} />
                  <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Clock size={20} color={COLORS.gray} />
                  <Text style={styles.dateTimeText}>{formatTime(startDate)}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInRight.delay(500)}>
              <Text style={styles.dateTimeLabel}>Fin</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Calendar size={20} color={COLORS.gray} />
                  <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Clock size={20} color={COLORS.gray} />
                  <Text style={styles.dateTimeText}>{formatTime(endDate)}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
          
          {/* Date/Time Pickers (ils apparaissent lorsqu'on clique sur les boutons) */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}
          
          {showStartTimePicker && (
            <DateTimePicker
              value={startDate}
              mode="time"
              display="default"
              onChange={onStartTimeChange}
            />
          )}
          
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}
          
          {showEndTimePicker && (
            <DateTimePicker
              value={endDate}
              mode="time"
              display="default"
              onChange={onEndTimeChange}
            />
          )}
        </Animated.View>
        
        {/* Section Lieu */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(600).springify()}
        >
          <Text style={styles.sectionTitle}>
            <MapPin size={18} color={COLORS.primary} style={styles.sectionIcon} />
            Lieu
          </Text>
          
          <View style={styles.inputContainer}>
            <MapPin size={20} color={COLORS.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Adresse ou lieu du rendez-vous"
            />
          </View>
        </Animated.View>
        
        {/* Section Notes */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(700).springify()}
        >
          <Text style={styles.sectionTitle}>
            <FileText size={18} color={COLORS.primary} style={styles.sectionIcon} />
            Notes
          </Text>
          
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ajouter des notes ou informations supplémentaires"
            multiline
            numberOfLines={4}
          />
        </Animated.View>
      </ScrollView>
      
      {/* Bouton de création */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateSlot}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <>
              <CheckCircle size={20} color={COLORS.background} />
              <Text style={styles.createButtonText}>Créer le créneau</Text>
            </>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.veryLightGray,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: '600',
    color: COLORS.dark,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.title,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  serviceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  serviceOption: {
    borderWidth: 1,
    borderColor: COLORS.veryLightGray,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    minWidth: '48%',
  },
  serviceOptionText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  serviceOptionPrice: {
    fontSize: SIZES.caption,
    color: COLORS.gray,
  },
  priceContainer: {
    marginTop: 8,
  },
  priceLabel: {
    fontSize: SIZES.caption,
    color: COLORS.gray,
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.veryLightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  priceInput: {
    flex: 1,
    height: 50,
    fontSize: SIZES.body,
  },
  priceCurrency: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginLeft: 8,
  },
  dateTimeSection: {
    marginBottom: 8,
  },
  dateTimeLabel: {
    fontSize: SIZES.caption,
    color: COLORS.gray,
    marginBottom: 8,
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.veryLightGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.veryLightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: SIZES.body,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.veryLightGray,
    borderRadius: 12,
    padding: 12,
    fontSize: SIZES.body,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.veryLightGray,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  createButtonText: {
    color: COLORS.background,
    fontSize: SIZES.body,
    fontWeight: '600',
    marginLeft: 8,
  },
});