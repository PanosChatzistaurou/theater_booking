import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TheaterDetailsScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* This sets the title in the header automatically */}
      <Stack.Screen options={{ title: name as string || 'Details', headerTintColor: '#E8E8E8', headerStyle: { backgroundColor: '#1E1E1E' } }} />
      
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Selected Theater ID</Text>
          <Text style={styles.value}>#{id}</Text>
          
          <Text style={[styles.label, { marginTop: 20 }]}>Theater Name</Text>
          <Text style={styles.value}>{name}</Text>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => alert('Coming soon: Movie selection & Seat grid!')}
        >
          <Text style={styles.buttonText}>View Showtimes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  content: { padding: 20, justifyContent: 'center', flex: 1 },
  infoCard: {
    backgroundColor: '#2C2C2C',
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    marginBottom: 30
  },
  label: { color: '#8B0000', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  value: { color: '#E8E8E8', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  actionButton: {
    backgroundColor: '#8B0000',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});