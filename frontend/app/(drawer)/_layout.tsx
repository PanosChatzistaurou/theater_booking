import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { router } from "expo-router";

export default function DrawerLayout() {
	return (
		<GestureHandlerRootView style={styles.root}>
			<Drawer
				screenOptions={{
					headerStyle: { backgroundColor: "#0D0D0D" },
					headerTintColor: "#E8E8E8",
					drawerStyle: { backgroundColor: "#0D0D0D" },
					drawerActiveTintColor: "#FFF",
					drawerActiveBackgroundColor: "#8B0000",
					drawerInactiveTintColor: "#555",
				}}
			>
				<Drawer.Screen
					name="index"
					options={{
						title: "THEATERS",
						drawerIcon: ({ color }) => (
							<Ionicons
								name="film-outline"
								size={22}
								color={color}
							/>
						),
					}}
				/>
				<Drawer.Screen
					name="profile"
					options={{
						title: "PROFILE",
						drawerIcon: ({ color }) => (
							<Ionicons
								name="person-outline"
								size={22}
								color={color}
							/>
						),
					}}
				/>
			
					
				
			</Drawer>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
});
