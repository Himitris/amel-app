// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Scissors, User, Settings } from 'lucide-react-native';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function TabLayout() {
  const { user, initialized } = useAuth();
  
  // Animation values for the add button
  const addButtonScale = useSharedValue(1);
  const addButtonRotation = useSharedValue(0);

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, initialized]);

  if (!initialized || !user) {
    return null;
  }
  
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
  
  const addButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: addButtonScale.value },
        { rotate: `${addButtonRotation.value * 45}deg` }
      ]
    };
  });

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
      {/* Assurez-vous que vous avez un fichier profile.tsx dans le dossier (tabs) */}
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