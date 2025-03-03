// app/create-slot.tsx
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEvents } from '../context/EventsContext';
import { Calendar, Clock, MapPin, User, Mail, Phone, AlertCircle, CheckCircle, Briefcase, Home as HomeIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const SERVICES = [
    { id: 'Coupe', name: 'Coupe', price: 35 },
    { id: 'Coloration', name: 'Coloration', price: 60 },
    { id: 'Coupe+Coloration', name: 'Coupe + Coloration', price: 85 },
    { id: 'Coiffage', name: 'Coiffage', price: 30 },
    { id: 'Soin', name: 'Soin', price: 25 },
    { id: 'Autre', name: 'Autre', price: 0 },
];

const COLORS_PALETTE = [
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

    // Type d'événement (nouveau)
    const [eventType, setEventType] = useState<'professional' | 'personal'>('professional');

    // Client info (pour événements professionnels)
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientAddress, setClientAddress] = useState('');

    // Event details
    const [service, setService] = useState('');
    const [personalTitle, setPersonalTitle] = useState(''); // Titre pour événements personnels
    const [message, setMessage] = useState('');
    const [selectedColor, setSelectedColor] = useState(
        eventType === 'professional' ? COLORS_PALETTE[4] : COLORS_PALETTE[2]
    );

    // Date and time
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));

    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Error state
    const [error, setError] = useState<string | null>(null);

    // Mettre à jour la couleur par défaut selon le type d'événement
    const changeEventType = (type: 'professional' | 'personal') => {
        setEventType(type);
        // Couleur par défaut selon le type
        if (type === 'personal') {
            setSelectedColor(COLORS_PALETTE[2]); // Jaune pour perso
        } else {
            setSelectedColor(COLORS_PALETTE[4]); // Bleu pour pro
        }
    };

    const handleCreateEvent = async () => {
        // Validation commune aux deux types d'événements
        if (endDate < startDate) {
            setError('La date de fin doit être après la date de début');
            return;
        }

        try {
            let title = '';
            let eventData: any = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                color: selectedColor,
                location: clientAddress,
                description: message,
                eventType: eventType // Sauvegarder le type d'événement
            };

            // Validation et préparation des données spécifiques au type
            if (eventType === 'professional') {
                if (!clientName) {
                    setError('Le nom du client est obligatoire');
                    return;
                }
                if (!service) {
                    setError('Veuillez sélectionner un service');
                    return;
                }
                title = `${service} - ${clientName}`;
                eventData.clientName = clientName;
                eventData.clientPhone = clientPhone;
                eventData.clientEmail = clientEmail;
                eventData.service = service;
            } else {
                if (!personalTitle) {
                    setError('Le titre est obligatoire');
                    return;
                }
                title = personalTitle;
            }

            // Définir le titre final
            eventData.title = title;

            await addEvent(eventData);

            Alert.alert(
                'Succès',
                `L'événement "${title}" a été créé`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
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
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.closeButtonText}>Annuler</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Nouvel événement</Text>
            </View>

            <ScrollView style={styles.content}>
                {error && (
                    <View style={styles.errorContainer}>
                        <AlertCircle size={20} color="#FF3B30" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Sélection du type d'événement */}
                <View style={styles.formGroup}>
                    <Text style={styles.sectionTitle}>Type d'événement</Text>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[
                                styles.typeOption,
                                eventType === 'professional' && styles.typeOptionSelected
                            ]}
                            onPress={() => changeEventType('professional')}
                        >
                            <Briefcase 
                                size={24} 
                                color={eventType === 'professional' ? COLORS.background : COLORS.primary} 
                            />
                            <Text style={[
                                styles.typeOptionText,
                                eventType === 'professional' && styles.typeOptionTextSelected
                            ]}>Professionnel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[
                                styles.typeOption,
                                eventType === 'personal' && styles.typeOptionSelected
                            ]}
                            onPress={() => changeEventType('personal')}
                        >
                            <HomeIcon 
                                size={24} 
                                color={eventType === 'personal' ? COLORS.background : COLORS.primary} 
                            />
                            <Text style={[
                                styles.typeOptionText,
                                eventType === 'personal' && styles.typeOptionTextSelected
                            ]}>Personnel</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Formulaire pour événements professionnels */}
                {eventType === 'professional' ? (
                    <>
                        <View style={styles.formGroup}>
                            <Text style={styles.sectionTitle}>Informations client</Text>

                            <View style={styles.inputContainer}>
                                <User size={20} color={COLORS.gray} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={clientName}
                                    onChangeText={setClientName}
                                    placeholder="Nom du client"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Phone size={20} color={COLORS.gray} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={clientPhone}
                                    onChangeText={setClientPhone}
                                    placeholder="Téléphone"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Mail size={20} color={COLORS.gray} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={clientEmail}
                                    onChangeText={setClientEmail}
                                    placeholder="Email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <MapPin size={20} color={COLORS.gray} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={clientAddress}
                                    onChangeText={setClientAddress}
                                    placeholder="Adresse (optionnel)"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.sectionTitle}>Service</Text>

                            <View style={styles.serviceOptions}>
                                {SERVICES.map((serviceItem) => (
                                    <TouchableOpacity
                                        key={serviceItem.id}
                                        style={[
                                            styles.serviceOption,
                                            service === serviceItem.id && {
                                                backgroundColor: COLORS.primary,
                                                borderColor: COLORS.primary
                                            }
                                        ]}
                                        onPress={() => setService(serviceItem.id)}
                                    >
                                        <Text style={[
                                            styles.serviceOptionText,
                                            service === serviceItem.id && { color: COLORS.background }
                                        ]}>
                                            {serviceItem.name}
                                        </Text>
                                        <Text style={[
                                            styles.serviceOptionPrice,
                                            service === serviceItem.id && { color: COLORS.background }
                                        ]}>
                                            {serviceItem.price} €
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </>
                ) : (
                    // Formulaire pour événements personnels
                    <View style={styles.formGroup}>
                        <Text style={styles.sectionTitle}>Détails</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={personalTitle}
                                onChangeText={setPersonalTitle}
                                placeholder="Titre de l'événement"
                            />
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <MapPin size={20} color={COLORS.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={clientAddress}
                                onChangeText={setClientAddress}
                                placeholder="Lieu (optionnel)"
                            />
                        </View>
                    </View>
                )}

                {/* Sélection de la date et heure - commun aux deux types */}
                <View style={styles.formGroup}>
                    <Text style={styles.sectionTitle}>Date et heure</Text>

                    <View>
                        <Text style={styles.inputLabel}>Début</Text>
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
                    </View>

                    <View style={styles.formSpacing}>
                        <Text style={styles.inputLabel}>Fin</Text>
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

                {/* Sélection de couleur - commun aux deux types */}
                <View style={styles.formGroup}>
                    <Text style={styles.sectionTitle}>Couleur</Text>

                    <View style={styles.colorContainer}>
                        {COLORS_PALETTE.map((color, index) => (
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

                {/* Notes - commun aux deux types */}
                <View style={styles.formGroup}>
                    <Text style={styles.sectionTitle}>Notes</Text>

                    <TextInput
                        style={styles.messageInput}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Informations supplémentaires"
                        multiline
                        numberOfLines={4}
                    />
                </View>
            </ScrollView>

            {/* Bouton de création */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateEvent}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.background} />
                    ) : (
                        <>
                            <CheckCircle size={20} color={COLORS.background} />
                            <Text style={styles.createButtonText}>
                                {eventType === 'professional' 
                                    ? 'Créer le rendez-vous' 
                                    : 'Créer l\'événement'}
                            </Text>
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
        justifyContent: 'space-between', // Pour espacer uniformément les éléments
        marginBottom: 16,
    },
    serviceOption: {
        borderWidth: 1,
        borderColor: COLORS.veryLightGray,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        flexBasis: '48%', // Définit la largeur à environ la moitié de l'écran
        alignItems: 'center', // Centre le texte dans les blocs
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
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.veryLightGray,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        flex: 0.48,
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
        marginBottom: 16,
        height: 50,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: SIZES.body,
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
    closeButton: {
        padding: 8,
      },
      closeButtonText: {
        fontSize: 16,
        color: COLORS.gray,
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
        marginBottom: 24,
      },
      inputLabel: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 8,
      },
      formSpacing: {
        marginTop: 16,
      },
      colorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
      messageInput: {
        borderWidth: 1,
        borderColor: COLORS.veryLightGray,
        borderRadius: 8,
        padding: 12,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 16,
      },
      typeSelector: {
        flexDirection: 'row',
        marginBottom: 16,
      },
      typeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        flex: 1,
      },
      typeOptionSelected: {
        backgroundColor: COLORS.primary,
      },
      typeOptionText: {
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 8,
      },
      typeOptionTextSelected: {
        color: COLORS.background,
      },
});