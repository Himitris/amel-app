// app/(tabs)/index.tsx
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router } from 'expo-router';
import { Clock, MapPin, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar as CalendarComponent, LocaleConfig } from 'react-native-calendars';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';

// Configuration de la locale pour le calendrier
LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  monthNamesShort: [
    'Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'
  ],
  dayNames: [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: 'Aujourd\'hui'
};
LocaleConfig.defaultLocale = 'fr';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MonthScreen = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM yyyy', { locale: fr }));
  const [eventsByDay, setEventsByDay] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [selectedDateFormatted, setSelectedDateFormatted] = useState('');

  const { events, loading, refreshEvents } = useEvents();

  // Charger les événements quand l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      refreshEvents();
    }
  }, [user]);

  // Traiter les événements pour les afficher sur le calendrier
  useEffect(() => {
    if (events) {
      // Stocker les événements par jour pour un accès facile
      const eventMap = {};
      const marked = {};

      events.forEach(event => {
        const eventDate = new Date(event.startDate).toISOString().split('T')[0];

        // Stocker l'événement dans un map par jour
        if (!eventMap[eventDate]) {
          eventMap[eventDate] = [];
        }
        eventMap[eventDate].push(event);

        // Créer les marqueurs pour le calendrier
        if (!marked[eventDate]) {
          marked[eventDate] = {
            dots: [],
            marked: true,
            selected: eventDate === selectedDate,
            customStyles: {
              container: {
                backgroundColor: eventDate === selectedDate ? COLORS.primary + '20' : 'transparent',
              },
              text: {
                color: eventDate === selectedDate ? COLORS.primary : COLORS.dark,
                fontWeight: eventDate === selectedDate ? 'bold' : 'normal',
              }
            }
          };
        }

        // Déterminer la couleur en fonction du type d'événement
        let color = event.color || COLORS.primary;
        if (!event.color) {
          if (event.eventType === 'personal') {
            color = '#FFCC00'; // Jaune pour événements personnels
          } else {
            // Couleurs basées sur le service pour les événements professionnels
            const title = event.title.toLowerCase();
            const service = event.service ? event.service.toLowerCase() : '';

            if (title.includes('coloration') || service.includes('coloration')) color = '#FF9500';
            else if (title.includes('coupe') || service.includes('coupe')) color = '#34C759';
            else if (title.includes('coiffage') || service.includes('coiffage')) color = '#5856D6';
            else if (title.includes('soin') || service.includes('soin')) color = '#FF2D55';
          }
        }

        // Ajouter l'événement dans l'objet marked pour le jour correspondant
        const eventLabel = getEventLabel(event);

        // Ajouter uniquement les étiquettes pour le premier événement du jour
        if (marked[eventDate] && marked[eventDate].marked && !marked[eventDate].eventLabel) {
          marked[eventDate].eventLabel = eventLabel;
          marked[eventDate].eventColor = color;
        }

        // Pour avoir plusieurs points par jour si plusieurs événements
        if (marked[eventDate].dots.length < 3) {
          marked[eventDate].dots.push({ color });
        }
      });

      setEventsByDay(eventMap);
      setMarkedDates(marked);

      // Mettre à jour les événements pour le jour sélectionné
      if (eventMap[selectedDate]) {
        setSelectedDateEvents(eventMap[selectedDate]);
        setSelectedDateFormatted(format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: fr }));
      } else {
        setSelectedDateEvents([]);
      }
    }
  }, [events, selectedDate]);

  // Obtenir une étiquette courte pour l'événement (pour l'affichage sur le calendrier)
  const getEventLabel = (event) => {
    // Exemples: "Coupe", "Réunion", "Anniversaire", etc.
    if (event.eventType === 'personal') {
      return event.title.length > 12 ? event.title.substring(0, 10) + '...' : event.title;
    } else {
      // Pour les événements professionnels, utiliser le service ou extraire du titre
      if (event.service) {
        return event.service.length > 12 ? event.service.substring(0, 10) + '...' : event.service;
      } else {
        const titleParts = event.title.split(' - ');
        if (titleParts.length > 1) {
          const service = titleParts[0];
          return service.length > 12 ? service.substring(0, 10) + '...' : service;
        } else {
          return event.title.length > 12 ? event.title.substring(0, 10) + '...' : event.title;
        }
      }
    }
  };

  const onDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    // Préparer les données pour le modal
    if (eventsByDay[dateString] && eventsByDay[dateString].length > 0) {
      setSelectedDateEvents(eventsByDay[dateString]);
      setSelectedDateFormatted(format(new Date(dateString), 'EEEE d MMMM yyyy', { locale: fr }));
      setModalVisible(true);
    } else {
      setSelectedDateEvents([]);
      setSelectedDateFormatted(format(new Date(dateString), 'EEEE d MMMM yyyy', { locale: fr }));
      // Ne pas ouvrir le modal s'il n'y a pas d'événements
    }
  };

  const onMonthChange = (month) => {
    const monthName = format(new Date(month.dateString), 'MMMM yyyy', { locale: fr });
    setCurrentMonth(monthName.charAt(0).toUpperCase() + monthName.slice(1));
  };

  // Rendu personnalisé du calendrier avec des étiquettes d'événements
  const renderCalendar = () => {
    // Option 1: Utiliser dayComponent pour personnaliser complètement le rendu des jours
    const customDayComponentRenderer = ({ date, state }) => {
      const { dateString, day } = date;
      const isToday = dateString === format(new Date(), 'yyyy-MM-dd');
      const hasEvents = eventsByDay[dateString] && eventsByDay[dateString].length > 0;
      const isSelected = dateString === selectedDate;

      // Récupérer l'étiquette d'événement si disponible
      const eventData = markedDates[dateString];
      const eventLabel = eventData?.eventLabel;
      const eventColor = eventData?.eventColor;

      return (
        <TouchableOpacity
          style={[
            styles.dayContainer,
            isToday && styles.todayContainer,
            isSelected && styles.selectedDayContainer
          ]}
          onPress={() => onDayPress({ dateString })}
        >
          <Text style={[
            styles.dayText,
            state === 'disabled' && styles.disabledDayText,
            isToday && styles.todayText,
            isSelected && styles.selectedDayText
          ]}>
            {day}
          </Text>

          {/* Afficher les étiquettes d'événements (jusqu'à 4) */}
          {hasEvents && eventsByDay[dateString].slice(0, Math.min(4, eventsByDay[dateString].length)).map((event, idx) => {
            const evtLabel = idx === 0 ? eventLabel : getEventLabel(event);
            const evtColor = idx === 0 ? eventColor : (event.color || (event.eventType === 'personal' ? '#FFCC00' : COLORS.primary));

            return (
              <View
                key={idx}
                style={[
                  styles.eventLabel,
                  {
                    backgroundColor: evtColor,
                    // Ajuster la taille selon le nombre d'événements
                    paddingVertical: eventsByDay[dateString].length > 2 ? 1 : 2,
                    marginTop: idx === 0 ? 2 : 1
                  }
                ]}
              >
                <Text style={styles.eventLabelText}>
                  {evtLabel}
                </Text>
              </View>
            );
          })}

          {/* Indicateur pour plus d'événements */}
          {hasEvents && eventsByDay[dateString].length > 4 && (
            <Text style={styles.moreEventsText}>+{eventsByDay[dateString].length - 4}</Text>
          )}
        </TouchableOpacity>
      );
    };

    return (
      <CalendarComponent
        current={selectedDate}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        firstDay={1} // Commencer par lundi
        hideExtraDays={false}
        enableSwipeMonths={true}
        dayComponent={customDayComponentRenderer}
        theme={{
          calendarBackground: COLORS.background,
          textSectionTitleColor: COLORS.gray,
          dayTextColor: COLORS.dark,
          textDisabledColor: COLORS.lightGray,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.dark,
          textDayFontFamily: FONTS.regular.fontFamily,
          textMonthFontFamily: FONTS.semiBold.fontFamily,
          textDayHeaderFontFamily: FONTS.medium.fontFamily,
          'stylesheet.calendar.header': {
            header: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingLeft: 10,
              paddingRight: 10,
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 10
            },
            week: {
              marginTop: 5,
              marginBottom: 5,
              flexDirection: 'row',
              justifyContent: 'space-around',
            },
          },
        }}
      />
    );
  };

  // Modal pour afficher les détails des événements du jour sélectionné
  const renderEventsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDateFormatted}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.eventsList}>
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event, index) => {
                  const startTime = format(new Date(event.startDate), 'HH:mm');
                  const endTime = format(new Date(event.endDate), 'HH:mm');
                  const isPersonal = event.eventType === 'personal';
                  const eventColor = event.color || (isPersonal ? '#FFCC00' : COLORS.primary);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.eventCard, { borderLeftColor: eventColor }]}
                      onPress={() => {
                        setModalVisible(false);
                        router.push({ pathname: '/event-details', params: { id: event.id } });
                      }}
                    >
                      <View style={styles.eventHeader}>
                        <View style={[styles.eventTypeIndicator, { backgroundColor: eventColor }]}>
                          <Text style={styles.eventTypeIndicatorText}>
                            {isPersonal ? 'P' : 'R'}
                          </Text>
                        </View>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                      </View>

                      <View style={styles.eventDetails}>
                        <View style={styles.eventTime}>
                          <Clock size={16} color={COLORS.gray} />
                          <Text style={styles.eventTimeText}>{startTime} - {endTime}</Text>
                        </View>

                        {event.location && (
                          <View style={styles.eventLocation}>
                            <MapPin size={16} color={COLORS.gray} />
                            <Text style={styles.eventLocationText}>{event.location}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.noEventsContainer}>
                  <Text style={styles.noEventsText}>Aucun événement ce jour</Text>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {currentMonth}
        </Text>
      </View>

      {renderCalendar()}
      {renderEventsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.veryLightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    textTransform: 'capitalize',
  },
  // Styles du calendrier
  dayContainer: {
    width: windowWidth / 7 - 2,
    height: windowWidth / 7 + 35, // Augmenté pour plus d'événements
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 2,
  },
  dayText: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.dark,
    marginTop: 5,
    marginBottom: 2,
  },
  disabledDayText: {
    color: COLORS.lightGray,
  },
  todayContainer: {
    backgroundColor: COLORS.accent + '30',
    borderRadius: 4,
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectedDayContainer: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
  },
  selectedDayText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  eventLabel: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
    width: '95%',
    alignItems: 'center',
  },
  eventLabelText: {
    fontSize: 7.5,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  moreEventsText: {
    fontSize: 8,
    color: COLORS.primary,
    marginTop: 1,
    fontWeight: '500',
  },
  // Styles du modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    ...SHADOWS.large,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.veryLightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    textTransform: 'capitalize',
  },
  closeButton: {
    padding: 4,
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  eventTypeIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
  },
  eventDetails: {
    paddingLeft: 32,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTimeText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 6,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocationText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 6,
  },
  noEventsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: COLORS.gray,
  },
});

export default MonthScreen;