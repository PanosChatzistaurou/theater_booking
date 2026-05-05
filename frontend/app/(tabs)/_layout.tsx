import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#8B0000',
      headerStyle: { backgroundColor: '#1E1E1E' },
      headerTintColor: '#FFF'
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Theaters',
          tabBarIcon: ({ color }) => <Ionicons name="film" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}