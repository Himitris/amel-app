// app/(tabs)/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, LogOut } from 'lucide-react-native';
import { COLORS, SIZES } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <User size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@exemple.com'}</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Settings size={24} color={COLORS.primary} style={styles.optionIcon} />
          <Text style={styles.optionText}>Paramètres</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <LogOut size={24} color={COLORS.error} style={styles.optionIcon} />
          <Text style={[styles.optionText, { color: COLORS.error }]}>Déconnexion</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.veryLightGray,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: SIZES.h2,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: SIZES.body,
    color: COLORS.gray,
  },
  optionsContainer: {
    padding: 16,
    marginTop: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.veryLightGray,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
});