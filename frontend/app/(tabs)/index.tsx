import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

// TYPES

interface Theater {
	id: number;
	name: string;
	location: string;
	description: string;
}

// COMPONENT

export default function HomeScreen() {
	const [theaters, setTheaters] = useState<Theater[]>([]);
	const [filtered, setFiltered] = useState<Theater[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		async function fetchTheaters() {
			try {
				const token = await SecureStore.getItemAsync("userToken");

				if (!token) {
					// No token found, redirect to login
					router.replace("/login");
					return;
				}

				const res = await axios.get(
					`${process.env.EXPO_PUBLIC_API_URL}/theaters`,
					{ headers: { Authorization: `Bearer ${token}` } },
				);
				setTheaters(res.data);
				setFiltered(res.data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchTheaters();
	}, []);

	// SEARCH HANDLER

	const handleSearch = (text: string) => {
		setSearch(text);
		const q = text.toLowerCase();
		setFiltered(
			theaters.filter(
				(t) =>
					t.name.toLowerCase().includes(q) ||
					t.location.toLowerCase().includes(q),
			),
		);
	};

	// RENDER

	return (
		<SafeAreaView style={styles.container} edges={["left", "right"]}>
			<View style={styles.searchContainer}>
				<Ionicons
					name="search-outline"
					size={18}
					color="#888"
					style={styles.searchIcon}
				/>
				<TextInput
					style={styles.searchInput}
					placeholder="Search theaters or locations..."
					placeholderTextColor="#666"
					value={search}
					onChangeText={handleSearch}
				/>
				{search.length > 0 && (
					<TouchableOpacity onPress={() => handleSearch("")}>
						<Ionicons name="close-circle" size={18} color="#888" />
					</TouchableOpacity>
				)}
			</View>

			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#8B0000" />
				</View>
			) : filtered.length === 0 ? (
				<View style={styles.center}>
					<Ionicons name="film-outline" size={48} color="#3D3D3D" />
					<Text style={styles.emptyText}>No theaters found</Text>
				</View>
			) : (
				<FlatList
					data={filtered}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContent}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={styles.card}
							activeOpacity={0.75}
							onPress={() =>
								router.push({
									pathname: "/theater-details",
									params: { id: item.id, name: item.name },
								})
							}
						>
							<View style={styles.iconBox}>
								<Ionicons
									name="business-outline"
									size={22}
									color="#8B0000"
								/>
							</View>

							<View style={styles.cardInfo}>
								<Text style={styles.cardTitle}>
									{item.name}
								</Text>
								<View style={styles.locationRow}>
									<Ionicons
										name="location-outline"
										size={13}
										color="#888"
									/>
									<Text style={styles.cardLocation}>
										{item.location}
									</Text>
								</View>
								{item.description ? (
									<Text
										style={styles.cardDescription}
										numberOfLines={1}
									>
										{item.description}
									</Text>
								) : null}
							</View>

							<Ionicons
								name="chevron-forward"
								size={18}
								color="#555"
							/>
						</TouchableOpacity>
					)}
				/>
			)}
		</SafeAreaView>
	);
}

// STYLES

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1E1E1E",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2C2C2C",
		marginHorizontal: 16,
		marginTop: 12,
		marginBottom: 8,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: "#3D3D3D",
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		color: "#E8E8E8",
		fontSize: 15,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 12,
	},
	emptyText: {
		color: "#555",
		fontSize: 15,
	},
	listContent: {
		padding: 16,
		paddingTop: 8,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2C2C2C",
		padding: 16,
		borderRadius: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#3D3D3D",
		elevation: 4,
	},
	iconBox: {
		width: 44,
		height: 44,
		borderRadius: 10,
		backgroundColor: "#1E1E1E",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 14,
	},
	cardInfo: {
		flex: 1,
		gap: 3,
	},
	cardTitle: {
		color: "#E8E8E8",
		fontSize: 16,
		fontWeight: "700",
	},
	locationRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	cardLocation: {
		color: "#888",
		fontSize: 13,
	},
	cardDescription: {
		color: "#666",
		fontSize: 12,
		marginTop: 2,
	},
});
