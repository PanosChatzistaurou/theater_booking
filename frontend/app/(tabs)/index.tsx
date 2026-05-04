import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Theater App</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Plays</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8B0000', 
  },
  header: {
    backgroundColor: '#8B0000', 
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E8E8E8', 
  },
  content: {
    flex: 1,
    backgroundColor: '#1E1E1E', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#8B0000', 
    width: '70%',
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#E8E8E8', 
    fontSize: 18,
    fontWeight: 'bold',
  },
});