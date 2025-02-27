import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { useEvents } from '../../context/EventsContext';
import { Calendar, Clock, MapPin, Users, Bell, CircleAlert as AlertCircle } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const COLORS = [
  '#FF3B30', // Rouge
  '#FF9500', // Orange
  '#FFCC00', // Jaune
  '#34C759', // Vert
  '#007AFF', // Bleu
  '#5856D6', // Violet
  '#AF52DE', // Mauve
  '#FF2D55', // Rose
];

export default function CreateEventScreen() {
  const { addEvent, loading } = useEvents();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
  const [selectedColor, setSelectedColor] = useState(COLORS[4]); // Default blue
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState(30); // 30 minutes before
  const [error, setError] = useState<string | null>(null);
  
  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleCreateEvent = async () => {
    if (!title) {
      setError('Le titre est obligatoire');
      return;
    }
    
    if (endDate < startDate) {
      setError('La date de fin doit être après la date de début');
      return;
    }
    
    try {
      await addEvent({
        title,
        description,
        location,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        color: selectedColor,
        reminder,
        reminderTime: reminder ? reminderTime : undefined,
      });
      
      router.back();
    } catch (err) {
      setError('Erreur lors de la création de l\'événement');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setShowStartTimePicker(Platform.OS === 'ios');
    
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
    setShowEndTimePicker(Platform.OS === 'ios');
    
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
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Titre</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ajouter un titre"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Ajouter une description"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Lieu</Text>
        <View style={styles.inputWithIcon}>
          <MapPin size={20} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIconField}
            value={location}
            onChangeText={setLocation}
            placeholder="Ajouter un lieu"
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Date et heure de début</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Calendar size={20} color="#8E8E93" />
            <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Clock size={20} color="#8E8E93" />
            <Text style={styles.dateTimeText}>{formatTime(startDate)}</Text>
          </TouchableOpacity>
        </View>
        
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
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Date et heure de fin</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Calendar size={20} color="#8E8E93" />
            <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Clock size={20} color="#8E8E93" />
            <Text style={styles.dateTimeText}>{formatTime(endDate)}</Text>
          </TouchableOpacity>
        </View>
        
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
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Couleur</Text>
        <View style={styles.colorContainer}>
          {COLORS.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColorOption,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.reminderContainer}>
          <View style={styles.reminderHeader}>
            <Bell size={20} color="#8E8E93" />
            <Text style={styles.reminderText}>Rappel</Text>
          </View>
          <Switch
            value={reminder}
            onValueChange={setReminder}
            trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        {reminder && (
          <View style={styles.reminderTimeContainer}>
            <Text style={styles.reminderTimeLabel}>Me rappeler</Text>
            <View style={styles.reminderTimeOptions}>
              <TouchableOpacity
                style={[
                  styles.reminderTimeOption,
                  reminderTime === 15 && styles.selectedReminderTimeOption,
                ]}
                onPress={() => setReminderTime(15)}
              >
                <Text style={[
                  styles.reminderTimeOptionText,
                  reminderTime === 15 && styles.selectedReminderTimeOptionText,
                ]}>15 min</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.reminderTimeOption,
                  reminderTime === 30 && styles.selectedReminderTimeOption,
                ]}
                onPress={() => setReminderTime(30)}
              >
                <Text style={[
                  styles.reminderTimeOptionText,
                  reminderTime === 30 && styles.selectedReminderTimeOptionText,
                ]}>30 min</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.reminderTimeOption,
                  reminderTime === 60 && styles.selectedReminderTimeOption,
                ]}
                onPress={() => setReminderTime(60)}
              >
                <Text style={[
                  styles.reminderTimeOptionText,
                  reminderTime === 60 && styles.selectedReminderTimeOptionText,
                ]}>1 heure</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateEvent}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>Créer l'événement</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEEEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIconField: {
    flex: 1,
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    marginBottom: 12,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#1C1C1E',
  },
  reminderTimeContainer: {
    marginTop: 8,
  },
  reminderTimeLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  reminderTimeOptions: {
    flexDirection: 'row',
  },
  reminderTimeOption: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  selectedReminderTimeOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  reminderTimeOptionText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  selectedReminderTimeOptionText: {
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});