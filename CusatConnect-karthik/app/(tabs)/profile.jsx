import { StyleSheet, Image, View, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isAuthenticated');
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText>Your profile information will appear here.</ThemedText>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText style={styles.logoutText}>Logout</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
