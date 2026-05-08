import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { api, getApiError } from "../../utils/api";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

// COMPONENT

export default function AuthScreen() {
	const [isRegistering, setIsRegistering] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	// AUTH HANDLER

	const handleAuth = async () => {
		setLoading(true);
		const endpoint = isRegistering ? "/auth/register" : "/auth/login";
		const payload = isRegistering
			? { name, email, password }
			: { email, password };

		try {
			const res = await api.post(endpoint, payload);

			if (isRegistering) {
				Alert.alert("Account Created", "You can now sign in.");
				setIsRegistering(false);
			} else {
				await SecureStore.setItemAsync("userToken", res.data.token);
				await SecureStore.setItemAsync("userName", res.data.user.name);
				await SecureStore.setItemAsync(
					"userEmail",
					res.data.user.email,
				);
				router.replace("/(drawer)");
			}
		} catch (err: unknown) {
            Alert.alert("Error", getApiError(err));
        }
	};

	// RENDER

	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<StatusBar style="light" />

			<View style={styles.posterStripe} />

			<ScrollView
				contentContainerStyle={styles.scroll}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.hero}>
					<View style={styles.taglineRow}>
						<View style={styles.taglineLine} />
						<Text style={styles.tagline}>NOW SHOWING</Text>
						<View style={styles.taglineLine} />
					</View>
					<Text style={styles.title}>STAGE{"\n"}PASS</Text>
					<Text style={styles.subtitle}>
						{isRegistering
							? "CREATE YOUR ACCOUNT"
							: "SIGN IN TO CONTINUE"}
					</Text>
				</View>

				<View style={styles.form}>
					{isRegistering && (
						<View style={styles.fieldWrap}>
							<Text style={styles.fieldLabel}>FULL NAME</Text>
							<TextInput
								style={styles.input}
								placeholder="John Doe"
								placeholderTextColor="#333"
								onChangeText={setName}
								autoCapitalize="words"
							/>
						</View>
					)}

					<View style={styles.fieldWrap}>
						<Text style={styles.fieldLabel}>EMAIL</Text>
						<TextInput
							style={styles.input}
							placeholder="you@example.com"
							placeholderTextColor="#333"
							onChangeText={setEmail}
							autoCapitalize="none"
							keyboardType="email-address"
						/>
					</View>

					<View style={styles.fieldWrap}>
						<Text style={styles.fieldLabel}>PASSWORD</Text>
						<TextInput
							style={styles.input}
							placeholder="••••••••"
							placeholderTextColor="#333"
							secureTextEntry
							onChangeText={setPassword}
						/>
					</View>

					<TouchableOpacity
						style={[
							styles.button,
							loading && styles.buttonDisabled,
						]}
						onPress={handleAuth}
						activeOpacity={0.85}
						disabled={loading}
					>
						<Text style={styles.buttonText}>
							{loading
								? "PLEASE WAIT..."
								: isRegistering
									? "CREATE ACCOUNT"
									: "SIGN IN"}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.toggle}
						onPress={() => setIsRegistering(!isRegistering)}
					>
						<Text style={styles.toggleText}>
							{isRegistering
								? "ALREADY HAVE AN ACCOUNT?  "
								: "NEW HERE?  "}
							<Text style={styles.toggleAccent}>
								{isRegistering ? "SIGN IN" : "REGISTER"}
							</Text>
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

// STYLES

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: "#0D0D0D",
	},
	posterStripe: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 4,
		backgroundColor: "#8B0000",
	},
	scroll: {
		flexGrow: 1,
		justifyContent: "center",
		paddingHorizontal: 28,
		paddingTop: 20,     
		paddingBottom: 250, 
	},
	hero: {
		marginBottom: 24,
	},
	taglineRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginBottom: 16,
	},
	taglineLine: {
		flex: 1,
		height: 1,
		backgroundColor: "#8B0000",
	},
	tagline: {
		color: "#8B0000",
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 4,
	},
	title: {
		color: "#E8E8E8",
		fontSize: 64,
		fontWeight: "900",
		lineHeight: 60,
		letterSpacing: -2,
		marginBottom: 14,
	},
	subtitle: {
		color: "#444",
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 3,
	},
	form: {
		gap: 4,
	},
	fieldWrap: {
		marginBottom: 16,
	},
	fieldLabel: {
		color: "#8B0000",
		fontSize: 10,
		fontWeight: "800",
		letterSpacing: 2.5,
		marginBottom: 8,
	},
	input: {
		backgroundColor: "#161616",
		color: "#E8E8E8",
		padding: 16,
		borderRadius: 4,
		fontSize: 15,
		borderWidth: 1,
		borderColor: "#222",
		borderLeftWidth: 3,
		borderLeftColor: "#8B0000",
	},
	button: {
		backgroundColor: "#8B0000",
		padding: 18,
		borderRadius: 4,
		alignItems: "center",
		marginTop: 8,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		color: "#FFF",
		fontWeight: "900",
		fontSize: 13,
		letterSpacing: 3,
	},
	toggle: {
		marginTop: 24,
		alignItems: "center",
	},
	toggleText: {
		color: "#444",
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 1.5,
	},
	toggleAccent: {
		color: "#8B0000",
	},
});
