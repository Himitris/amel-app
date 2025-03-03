// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Scissors, User } from 'lucide-react-native';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function TabLayout() {
  // Tous les hooks doivent être appelés au tout début du composant
  const { user, initialized } = useAuth();
  
  // Animation values
  const addButtonScale = useSharedValue(1);
  const addButtonRotation = useSharedValue(0);
  
  // On déclare les refs avant les conditions
  const navigationRef = useRef(null);
  const extraRef = useRef(null); // Ajout d'un useRef supplémentaire au cas où

  // On déclare tous les styles animés en avance, même s'ils ne sont pas utilisés
  const addButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: addButtonScale.value },
        { rotate: `${addButtonRotation.value * 45}deg` }
      ]
    };
  });
  
  // Tous les effets sont définis au début, avant toute condition de retour
  useEffect(() => {
    if (initialized && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, initialized]);
  
  // Définir la fonction de gestion du clic sur le bouton d'ajout
  const handleAddPress = () => {
    // Animate the button
    addButtonScale.value = withSpring(0.8, {}, () => {
      addButtonScale.value = withSpring(1);
    });
    
    addButtonRotation.value = withTiming(1, { duration: 300 }, () => {
      addButtonRotation.value = withTiming(0, { duration: 300 });
    });
    
    // Navigate to create screen
    router.push('/create-slot');
  };

  // Maintenant on peut mettre les conditions de retour
  if (!initialized || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.veryLightGray,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.veryLightGray,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: COLORS.dark,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendrier',
          tabBarIcon: ({ color, size }) => <Calendar size={size-2} color={color} />,
          headerTitle: 'Calendrier',
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: 'Semaine',
          tabBarIcon: ({ color, size }) => <Clock size={size-2} color={color} />,
          headerTitle: 'Vue Semaine',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={styles.addButtonContainer}>
              <AnimatedTouchable 
                style={[styles.addButton, addButtonAnimatedStyle]}
                onPress={handleAddPress}
              >
                <View style={styles.addButtonIcon}>
                  <Scissors size={24} color={COLORS.background} />
                </View>
              </AnimatedTouchable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Rendez-vous',
          tabBarIcon: ({ color, size }) => <Scissors size={size-2} color={color} />,
          headerTitle: 'Rendez-vous',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size-2} color={color} />,
          headerTitle: 'Mon Profil',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -15,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  addButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});