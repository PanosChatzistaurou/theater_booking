import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const name = await SecureStore.getItemAsync('userName');
      const email = await SecureStore.getItemAsync('userEmail');
      setUserData({ 
        name: name || 'Guest User', 
        email: email || 'No email found' 
      });
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    // Clear everything on logout
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userName');
    await SecureStore.deleteItemAsync('userEmail');
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color="#E8E8E8" />
        </View>
        {/* Dynamic User Data */}
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Account Settings</Text>
        <TouchableOpacity style={styles.optionCard}>
          <View style={styles.optionIconContainer}><Ionicons name="ticket-outline" size={22} color="#8B0000" /></View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>My Bookings</Text>
            <Text style={styles.optionSubtitle}>View your upcoming shows</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  header: {
    backgroundColor: '#8B0000',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#E8E8E8',
  },
  userName: { color: '#E8E8E8', fontSize: 22, fontWeight: 'bold' },
  userEmail: { color: '#FF9999', fontSize: 14, marginTop: 5 },
  content: { padding: 20 },
  sectionLabel: { color: '#8B0000', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionTextContainer: { flex: 1 },
  optionTitle: { color: '#E8E8E8', fontSize: 16, fontWeight: '600' },
  optionSubtitle: { color: '#B0B0B0', fontSize: 12, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#8B0000',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  logoutButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});