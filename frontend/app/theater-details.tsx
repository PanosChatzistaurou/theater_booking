import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, getApiError } from "../utils/api";


// TYPES

interface Showtime {
	showtime_id: number;
	title: string;
	start_time: string;
	price: string;
}

// HELPERS

function formatDateTime(iso: string) {
	const date = new Date(iso);
	return {
		date: date.toLocaleDateString("en-GB", {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
		}),
		time: date.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		}),
	};
}

// COMPONENT

export default function TheaterDetailsScreen() {
	const { id, name } = useLocalSearchParams();
	const router = useRouter();
	const [showtimes, setShowtimes] = useState<Showtime[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchShowtimes() {
			try {
				const res = await api.get(`/theaters/${id}/showtimes`);
				setShowtimes(res.data);
			} catch (err: unknown) {
				Alert.alert("Error", getApiError(err));
			} finally {
				setLoading(false);
			}
		}
		fetchShowtimes();
	}, [id]);

	// RENDER

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
                    headerShown: true,
					title: (name as string) || "Theater",
					headerTintColor: "#E8E8E8",
					headerStyle: { backgroundColor: "#1E1E1E" },
					headerShadowVisible: false,
				}}
			/>

			<View style={styles.header}>
				<View style={styles.headerIconBox}>
					<Ionicons
						name="business-outline"
						size={28}
						color="#8B0000"
					/>
				</View>
				<Text style={styles.headerName}>{name}</Text>
				<Text style={styles.headerSubtitle}>Select a showtime</Text>
			</View>

			<Text style={styles.sectionLabel}>Available Showtimes</Text>

			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#8B0000" />
				</View>
			) : showtimes.length === 0 ? (
				<View style={styles.center}>
					<Ionicons
						name="calendar-outline"
						size={48}
						color="#3D3D3D"
					/>
					<Text style={styles.emptyText}>No showtimes available</Text>
				</View>
			) : (
				<FlatList
					data={showtimes}
					keyExtractor={(item) => item.showtime_id.toString()}
					contentContainerStyle={styles.listContent}
					renderItem={({ item }) => {
						const { date, time } = formatDateTime(item.start_time);
						return (
							<TouchableOpacity
								style={styles.card}
								activeOpacity={0.75}
								onPress={() =>
									router.push({
										pathname: "/showtime-details",
										params: {
											showtime_id: item.showtime_id,
											title: item.title,
											date,
											time,
											price: item.price,
											theater_name: name,
										},
									})
								}
							>
								<View style={styles.cardLeft}>
									<Text style={styles.cardTitle}>
										{item.title}
									</Text>
									<View style={styles.row}>
										<Ionicons
											name="calendar-outline"
											size={13}
											color="#888"
										/>
										<Text style={styles.cardDate}>
											{date}
										</Text>
									</View>
									<View style={styles.row}>
										<Ionicons
											name="time-outline"
											size={13}
											color="#888"
										/>
										<Text style={styles.cardTime}>
											{time}
										</Text>
									</View>
								</View>

								<View style={styles.cardRight}>
									<Text style={styles.price}>
										€{Number(item.price).toFixed(2)}
									</Text>
									<Ionicons
										name="chevron-forward"
										size={16}
										color="#555"
									/>
								</View>
							</TouchableOpacity>
						);
					}}
				/>
			)}
		</View>
	);
}

// STYLES

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0D0D0D",
	},
	header: {
		alignItems: "center",
		paddingVertical: 24,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#161616",
	},
	headerIconBox: {
		width: 60,
		height: 60,
		borderRadius: 16,
		backgroundColor: "#161616",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	headerName: {
		color: "#E8E8E8",
		fontSize: 20,
		fontWeight: "700",
		marginBottom: 4,
	},
	headerSubtitle: {
		color: "#666",
		fontSize: 13,
	},
	sectionLabel: {
		color: "#8B0000",
		fontSize: 11,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 1.2,
		marginHorizontal: 16,
		marginTop: 20,
		marginBottom: 10,
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
		paddingTop: 0,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#161616",
		padding: 16,
		borderRadius: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#222",
	},
	cardLeft: {
		flex: 1,
		gap: 5,
	},
	cardTitle: {
		color: "#E8E8E8",
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 2,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	cardDate: {
		color: "#888",
		fontSize: 13,
	},
	cardTime: {
		color: "#888",
		fontSize: 13,
	},
	cardRight: {
		alignItems: "flex-end",
		gap: 6,
	},
	price: {
		color: "#8B0000",
		fontSize: 18,
		fontWeight: "700",
	},
});
