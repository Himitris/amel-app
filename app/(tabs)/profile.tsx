// app/(tabs)/profile.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Settings, 
  LogOut, 
  Mail, 
  Lock, 
  Phone, 
  Home, 
  Check, 
  X, 
  Edit, 
  Shield
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { 
  updatePassword as firebaseUpdatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  updateEmail as firebaseUpdateEmail,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Timestamp, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function ProfileScreen() {
  const { user, signOut, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [extended, setExtended] = useState(false);
  
  // État pour les modals
  const [modalVisible, setModalVisible] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
    password: false,
  });
  
  // État pour les entrées de formulaire
  const [formInputs, setFormInputs] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Chargement des données utilisateur supplémentaires depuis Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const userDocRef = doc(db, 'users', user.id);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(prevData => ({
              ...prevData,
              name: user.name || '',
              email: user.email || '',
              phone: data.phone || '',
              address: data.address || '',
            }));
          } else {
            // Créer le document utilisateur s'il n'existe pas
            await setDoc(userDocRef, {
              name: user.name,
              email: user.email,
              createdAt: Timestamp.now(),
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error);
          Alert.alert('Erreur', 'Impossible de charger vos informations');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };
  
  // Ouverture d'un modal
  const openModal = (type) => {
    // Réinitialiser les entrées de formulaire avec les valeurs actuelles
    setFormInputs({
      ...formInputs,
      [type]: userData[type],
    });
    
    setModalVisible({
      ...Object.keys(modalVisible).reduce((acc, key) => ({...acc, [key]: false}), {}),
      [type]: true
    });
  };
  
  // Fermeture de tous les modals
  const closeAllModals = () => {
    setModalVisible(Object.keys(modalVisible).reduce((acc, key) => ({...acc, [key]: false}), {}));
  };
  
  // Mise à jour du nom
  const updateName = async () => {
    if (!formInputs.name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }
    
    try {
      setLoading(true);
      
      // Mettre à jour le profil Firebase Auth
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: formInputs.name,
        });
      }
      
      // Mettre à jour Firestore
      if (user?.id) {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          name: formInputs.name,
          updatedAt: Timestamp.now(),
        });
      }
      
      // Mettre à jour l'état local
      setUserData({
        ...userData,
        name: formInputs.name,
      });
      
      // Mettre à jour l'état global utilisateur
      updateUserProfile({
        name: formInputs.name,
      });
      
      Alert.alert('Succès', 'Nom mis à jour avec succès');
      closeAllModals();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le nom');
    } finally {
      setLoading(false);
    }
  };
  
  // Mise à jour de l'email
  const updateEmail = async () => {
    if (!formInputs.email.trim() || !formInputs.currentPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setLoading(true);
      
      // Réauthentifier l'utilisateur
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          formInputs.currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Mettre à jour l'email dans Firebase Auth
        await firebaseUpdateEmail(auth.currentUser, formInputs.email);
        
        // Mettre à jour Firestore
        if (user?.id) {
          const userDocRef = doc(db, 'users', user.id);
          await updateDoc(userDocRef, {
            email: formInputs.email,
            updatedAt: Timestamp.now(),
          });
        }
        
        // Mettre à jour l'état local
        setUserData({
          ...userData,
          email: formInputs.email,
        });
        
        // Mettre à jour l'état global utilisateur
        updateUserProfile({
          email: formInputs.email,
        });
        
        Alert.alert('Succès', 'Email mis à jour avec succès');
        closeAllModals();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'email:', error);
      
      // Messages d'erreur plus spécifiques
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Erreur', 'Mot de passe incorrect');
      } else if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Erreur', 'Cet email est déjà utilisé');
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour l\'email');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Mise à jour du mot de passe
  const updatePassword = async () => {
    if (!formInputs.currentPassword || !formInputs.newPassword || !formInputs.confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    if (formInputs.newPassword !== formInputs.confirmPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    if (formInputs.newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    try {
      setLoading(true);
      
      // Réauthentifier l'utilisateur
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          formInputs.currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Mettre à jour le mot de passe
        await firebaseUpdatePassword(auth.currentUser, formInputs.newPassword);
        
        Alert.alert('Succès', 'Mot de passe mis à jour avec succès');
        closeAllModals();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Erreur', 'Mot de passe actuel incorrect');
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour le mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Mise à jour du téléphone
  const updatePhone = async () => {
    try {
      setLoading(true);
      
      if (user?.id) {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          phone: formInputs.phone,
          updatedAt: Timestamp.now(),
        });
      }
      
      setUserData({
        ...userData,
        phone: formInputs.phone,
      });
      
      Alert.alert('Succès', 'Numéro de téléphone mis à jour avec succès');
      closeAllModals();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du téléphone:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le numéro de téléphone');
    } finally {
      setLoading(false);
    }
  };
  
  // Mise à jour de l'adresse
  const updateAddress = async () => {
    try {
      setLoading(true);
      
      if (user?.id) {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          address: formInputs.address,
          updatedAt: Timestamp.now(),
        });
      }
      
      setUserData({
        ...userData,
        address: formInputs.address,
      });
      
      Alert.alert('Succès', 'Adresse mise à jour avec succès');
      closeAllModals();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'adresse:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'adresse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <User size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>{userData.name || 'Utilisateur'}</Text>
        <Text style={styles.userEmail}>{userData.email || 'email@exemple.com'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        
        <TouchableOpacity style={styles.option} onPress={() => openModal('name')}>
          <View style={styles.optionIcon}>
            <User size={20} color={COLORS.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionLabel}>Nom</Text>
            <Text style={styles.optionValue}>{userData.name}</Text>
          </View>
          <Edit size={18} color={COLORS.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => openModal('email')}>
          <View style={styles.optionIcon}>
            <Mail size={20} color={COLORS.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionLabel}>Email</Text>
            <Text style={styles.optionValue}>{userData.email}</Text>
          </View>
          <Edit size={18} color={COLORS.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => openModal('phone')}>
          <View style={styles.optionIcon}>
            <Phone size={20} color={COLORS.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionLabel}>Téléphone</Text>
            <Text style={styles.optionValue}>{userData.phone || 'Non renseigné'}</Text>
          </View>
          <Edit size={18} color={COLORS.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => openModal('address')}>
          <View style={styles.optionIcon}>
            <Home size={20} color={COLORS.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionLabel}>Adresse</Text>
            <Text style={styles.optionValue}>{userData.address || 'Non renseignée'}</Text>
          </View>
          <Edit size={18} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sécurité</Text>
        
        <TouchableOpacity style={styles.option} onPress={() => openModal('password')}>
          <View style={styles.optionIcon}>
            <Lock size={20} color={COLORS.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionLabel}>Mot de passe</Text>
            <Text style={styles.optionValue}>••••••••</Text>
          </View>
          <Edit size={18} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <LogOut size={20} color={COLORS.error} style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
      
      {/* Modal pour modifier le nom */}
      <Modal
        visible={modalVisible.name}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier le nom</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nouveau nom"
              value={formInputs.name}
              onChangeText={(text) => setFormInputs({...formInputs, name: text})}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeAllModals}
              >
                <X size={18} color={COLORS.gray} />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateName}
              >
                <Check size={18} color={COLORS.background} />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal pour modifier l'email */}
      <Modal
        visible={modalVisible.email}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier l'email</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nouvel email"
              value={formInputs.email}
              onChangeText={(text) => setFormInputs({...formInputs, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Mot de passe actuel"
              value={formInputs.currentPassword}
              onChangeText={(text) => setFormInputs({...formInputs, currentPassword: text})}
              secureTextEntry
            />
            
            <View style={styles.securityNote}>
              <Shield size={16} color={COLORS.warning} />
              <Text style={styles.securityNoteText}>
                Pour des raisons de sécurité, nous avons besoin de votre mot de passe actuel
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeAllModals}
              >
                <X size={18} color={COLORS.gray} />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateEmail}
              >
                <Check size={18} color={COLORS.background} />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal pour modifier le mot de passe */}
      <Modal
        visible={modalVisible.password}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier le mot de passe</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Mot de passe actuel"
              value={formInputs.currentPassword}
              onChangeText={(text) => setFormInputs({...formInputs, currentPassword: text})}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              value={formInputs.newPassword}
              onChangeText={(text) => setFormInputs({...formInputs, newPassword: text})}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              value={formInputs.confirmPassword}
              onChangeText={(text) => setFormInputs({...formInputs, confirmPassword: text})}
              secureTextEntry
            />
            
            <View style={styles.securityNote}>
              <Shield size={16} color={COLORS.warning} />
              <Text style={styles.securityNoteText}>
                Votre mot de passe doit contenir au moins 8 caractères
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeAllModals}
              >
                <X size={18} color={COLORS.gray} />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={updatePassword}
              >
                <Check size={18} color={COLORS.background} />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal pour modifier le téléphone */}
      <Modal
        visible={modalVisible.phone}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier le téléphone</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nouveau numéro de téléphone"
              value={formInputs.phone}
              onChangeText={(text) => setFormInputs({...formInputs, phone: text})}
              keyboardType="phone-pad"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeAllModals}
              >
                <X size={18} color={COLORS.gray} />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={updatePhone}
              >
                <Check size={18} color={COLORS.background} />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal pour modifier l'adresse */}
      <Modal
        visible={modalVisible.address}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier l'adresse</Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nouvelle adresse"
              value={formInputs.address}
              onChangeText={(text) => setFormInputs({...formInputs, address: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeAllModals}
              >
                <X size={18} color={COLORS.gray} />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateAddress}
              >
                <Check size={18} color={COLORS.background} />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
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
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: SIZES.title,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.veryLightGray,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginBottom: 2,
  },
  optionValue: {
    fontSize: SIZES.body,
    color: COLORS.dark,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.error + '10',
    borderRadius: 8,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: SIZES.body,
    color: COLORS.error,
    fontWeight: '600',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    ...SHADOWS.large,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.veryLightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: SIZES.body,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityNoteText: {
    flex: 1,
    fontSize: SIZES.caption,
    color: COLORS.dark,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  cancelButton: {
    backgroundColor: COLORS.veryLightGray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    fontWeight: '500',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: SIZES.body,
    color: COLORS.background,
    fontWeight: '600',
    marginLeft: 8,
  },
});