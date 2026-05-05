import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

interface Theater {
  id: number;
  name: string;
  location: string;
}

export default function HomeScreen() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/theaters`)
      .then((res) => setTheaters(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#8B0000" />
        </View>
      ) : (
        <FlatList
          data={theaters}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push({
                pathname: "/theater-details", // Example for next step
                params: { id: item.id, name: item.name }
              })}
            >
              <View style={styles.iconBox}>
                <Ionicons name="videocam" size={24} color="#8B0000" />
              </View>
              
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#B0B0B0" />
                  <Text style={styles.cardLocation}>{item.location}</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#555" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1E1E1E" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  listContent: { 
    padding: 15,
    paddingTop: 10 
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    // Soft shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardInfo: { 
    flex: 1 
  },
  cardTitle: { 
    color: "#E8E8E8", 
    fontSize: 18, 
    fontWeight: "bold",
    marginBottom: 4
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLocation: { 
    color: "#B0B0B0", 
    fontSize: 14,
    marginLeft: 4
  },
});