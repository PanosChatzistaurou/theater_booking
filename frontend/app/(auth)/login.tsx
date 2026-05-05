import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function AuthScreen() {
	const [isRegistering, setIsRegistering] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const router = useRouter();

	const handleAuth = async () => {
		const endpoint = isRegistering ? "/auth/register" : "/auth/login";
		const payload = isRegistering
			? { name, email, password }
			: { email, password };

		try {
			const res = await axios.post(
				`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`,
				payload,
			);

			if (!isRegistering) {
				// Save Token, Name, and Email
				await SecureStore.setItemAsync("userToken", res.data.token);
				await SecureStore.setItemAsync("userName", res.data.user.name);
				await SecureStore.setItemAsync(
					"userEmail",
					res.data.user.email,
				);

				router.replace("/(tabs)");
			}
		} catch (err: any) {
			const errorDetail = err.response?.data?.error || err.message;
			Alert.alert("Error", errorDetail);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>
				{isRegistering ? "Create Account" : "Welcome Back"}
			</Text>

			{/* Show name input only when registering */}
			{isRegistering && (
				<TextInput
					style={styles.input}
					placeholder="Full Name"
					placeholderTextColor="#888"
					onChangeText={setName}
					autoCapitalize="words"
				/>
			)}

			<TextInput
				style={styles.input}
				placeholder="Email"
				placeholderTextColor="#888"
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				placeholderTextColor="#888"
				secureTextEntry
				onChangeText={setPassword}
			/>

			<TouchableOpacity style={styles.button} onPress={handleAuth}>
				<Text style={styles.buttonText}>
					{isRegistering ? "Register" : "Login"}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
				<Text style={styles.toggleText}>
					{isRegistering
						? "Already have an account? Login"
						: "Need an account? Register"}
				</Text>
			</TouchableOpacity>

			{/* 
        TODO: Add log in with Google
      */}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1E1E1E",
		justifyContent: "center",
		padding: 20,
	},
	title: {
		color: "#8B0000",
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		backgroundColor: "#2C2C2C",
		color: "#FFF",
		padding: 15,
		borderRadius: 8,
		marginBottom: 15,
	},
	button: {
		backgroundColor: "#8B0000",
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
	buttonText: {
		color: "#FFF",
		fontWeight: "bold",
		fontSize: 16,
	},
	toggleText: {
		color: "#B0B0B0",
		marginTop: 20,
		textAlign: "center",
	},
});
