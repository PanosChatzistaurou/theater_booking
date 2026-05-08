import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	TextInput,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, getApiError } from "../../utils/api";
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
				const res = await api.get('/theaters');
				setTheaters(res.data);
				setFiltered(res.data);
			} catch (err: unknown) {
				Alert.alert("Error", getApiError(err));
			} finally {
				setLoading(false);
			}
		}
		fetchTheaters();
	}, []);

	// SEARCH HANDLER

	const handleSearch = async (text: string) => {
		setSearch(text);
		try {
			const res = await api.get(`/theaters?q=${text}`);
			setFiltered(res.data);
		} catch (err: unknown) {
               Alert.alert("Error", getApiError(err));
        } 
	};

	// RENDER

	return (
		<SafeAreaView style={styles.container} edges={["left", "right"]}>
			<View style={styles.searchContainer}>
				<Ionicons name="search-outline" size={16} color="#444" />
				<TextInput
					style={styles.searchInput}
					placeholder="SEARCH THEATERS..."
					placeholderTextColor="#333"
					value={search}
					onChangeText={handleSearch}
				/>
				{search.length > 0 && (
					<TouchableOpacity onPress={() => handleSearch("")}>
						<Ionicons name="close" size={16} color="#444" />
					</TouchableOpacity>
				)}
			</View>

			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#8B0000" />
				</View>
			) : filtered.length === 0 ? (
				<View style={styles.center}>
					<Text style={styles.emptyLabel}>NO RESULTS</Text>
				</View>
			) : (
				<FlatList
					data={filtered}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContent}
					ItemSeparatorComponent={() => (
						<View style={styles.separator} />
					)}
					renderItem={({ item, index }) => (
						<TouchableOpacity
							style={styles.card}
							activeOpacity={0.7}
							onPress={() =>
								router.push({
									pathname: "/theater-details",
									params: { id: item.id, name: item.name },
								})
							}
						>
							<Text style={styles.cardIndex}>
								{String(index + 1).padStart(2, "0")}
							</Text>
							<View style={styles.cardBody}>
								<Text style={styles.cardName}>
									{item.name.toUpperCase()}
								</Text>
								<View style={styles.locationRow}>
									<Ionicons
										name="location-outline"
										size={11}
										color="#555"
									/>
									<Text style={styles.cardLocation}>
										{item.location.toUpperCase()}
									</Text>
								</View>
							</View>
							<Ionicons
								name="arrow-forward"
								size={16}
								color="#8B0000"
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
	container: { flex: 1, backgroundColor: "#0D0D0D" },
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginHorizontal: 20,
		marginTop: 16,
		marginBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#222",
		paddingBottom: 12,
	},
	searchInput: {
		flex: 1,
		color: "#E8E8E8",
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 2,
	},
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	emptyLabel: {
		color: "#2A2A2A",
		fontSize: 13,
		fontWeight: "800",
		letterSpacing: 4,
	},
	listContent: { paddingHorizontal: 20, paddingBottom: 40 },
	separator: { height: 1, backgroundColor: "#161616" },
	card: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 20,
		gap: 16,
	},
	cardIndex: {
		color: "#8B0000",
		fontSize: 11,
		fontWeight: "900",
		letterSpacing: 1,
		width: 24,
	},
	cardBody: { flex: 1, gap: 5 },
	cardName: {
		color: "#E8E8E8",
		fontSize: 15,
		fontWeight: "800",
		letterSpacing: 1.5,
	},
	locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
	cardLocation: {
		color: "#444",
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 1.5,
	},
});
