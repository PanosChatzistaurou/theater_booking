import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router"; // Imperative router API
import { Platform } from "react-native";

export const api = axios.create({
	baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(
	async (config) => {
		if (Platform.OS !== "web") {
			const token = await SecureStore.getItemAsync("userToken");
			if (token) {
				// CORRECT SAFE ASSIGNMENT
				config.headers.set("Authorization", `Bearer ${token}`);
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (
			error.response &&
			(error.response.status === 401 || error.response.status === 403)
		) {
			// Token expired or invalid - wipe it and kick them to login
			if (Platform.OS !== "web") {
				await SecureStore.deleteItemAsync("userToken");
			}
			// Use the imperative router to redirect from outside a React component
			router.replace("/(auth)/login");
		}
		return Promise.reject(error);
	},
);

export function getApiError(err: unknown): string {
	if (axios.isAxiosError(err)) {
		// It's an API error, extract the backend message safely
		return err.response?.data?.error || "Network error occurred.";
	}
	// It's a random frontend error (e.g., a typo in your code)
	if (err instanceof Error) {
		return err.message;
	}
	return "An unexpected error occurred.";
}
