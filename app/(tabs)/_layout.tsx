import { Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Plus, User, Settings } from 'lucide-react-native';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function TabLayout() {
  const { user, initialized } = useAuth();

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, initialized]);

  if (!initialized || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5EA',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mois',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: 'Semaine',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <TouchableOpacity style={styles.addButton}>
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerShown: true,
          headerTitle: 'Nouvel événement',
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
});