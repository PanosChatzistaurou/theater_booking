import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	Alert,
	RefreshControl,
} from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, getApiError } from "../utils/api";

// TYPES

interface Reservation {
	reservation_id: number;
	status: "PENDING" | "CONFIRMED" | "CANCELLED";
	expires_at: string | null;
	created_at: string;
	show_title: string;
	start_time: string;
	price: string;
	theater_name: string;
	theater_location: string;
	row_label: string;
	column_number: number;
}

// HELPERS

function formatDateTime(iso: string) {
	const date = new Date(iso);
	return date.toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function statusColor(status: string) {
	if (status === "CONFIRMED") return "#2E7D32";
	if (status === "CANCELLED") return "#555";
	return "#8B6000";
}

function statusBg(status: string) {
	if (status === "CONFIRMED") return "#1A2E1A";
	if (status === "CANCELLED") return "#1A1A1A";
	return "#2E2400";
}

// COMPONENT

export default function BookingsScreen() {
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const fetchReservations = async (isRefresh = false) => {
		if (isRefresh) setRefreshing(true);
		try {
			const res = await api.get('/reservations');

			const activeReservations = res.data.filter(
				(item: Reservation) => item.status !== "CANCELLED",
			);

			setReservations(activeReservations);
		} catch (err: unknown) {
			Alert.alert("Error", getApiError(err));
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	// REFRESH ON SCREEN FOCUS

	useFocusEffect(
		useCallback(() => {
			fetchReservations();
		}, []),
	);

	// CANCEL HANDLER

	const handleCancel = (id: number) => {
		Alert.alert(
			"Cancel Booking",
			"Are you sure you want to cancel this booking?",
			[
				{ text: "No", style: "cancel" },
				{
					text: "Yes, Cancel",
					style: "destructive",
					onPress: async () => {
						try {
							await api.delete(`/reservations/${id}`);
							fetchReservations();
						} catch (err: unknown) {
                            Alert.alert("Error", getApiError(err));
                        }
					},
				},
			],
		);
	};

	// RENDER

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: "My Bookings",
					headerTintColor: "#E8E8E8",
					headerStyle: { backgroundColor: "#1E1E1E" },
					headerShadowVisible: false,
				}}
			/>

			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#8B0000" />
				</View>
			) : reservations.length === 0 ? (
				<View style={styles.center}>
					<Ionicons name="ticket-outline" size={52} color="#3D3D3D" />
					<Text style={styles.emptyTitle}>No bookings yet</Text>
					<Text style={styles.emptySubtitle}>
						Browse theaters to book a show
					</Text>
				</View>
			) : (
				<FlatList
					data={reservations}
					keyExtractor={(item) => item.reservation_id.toString()}
					contentContainerStyle={styles.listContent}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => fetchReservations(true)}
							tintColor="#8B0000"
						/>
					}
					renderItem={({ item }) => (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<Text
									style={styles.showTitle}
									numberOfLines={1}
								>
									{item.show_title}
								</Text>
								<View
									style={[
										styles.statusBadge,
										{
											backgroundColor: statusBg(
												item.status,
											),
										},
									]}
								>
									<Text
										style={[
											styles.statusText,
											{
												color: statusColor(item.status),
											},
										]}
									>
										{item.status}
									</Text>
								</View>
							</View>

							<View style={styles.cardBody}>
								<View style={styles.infoRow}>
									<Ionicons
										name="business-outline"
										size={13}
										color="#666"
									/>
									<Text style={styles.infoText}>
										{item.theater_name}
									</Text>
								</View>
								<View style={styles.infoRow}>
									<Ionicons
										name="calendar-outline"
										size={13}
										color="#666"
									/>
									<Text style={styles.infoText}>
										{formatDateTime(item.start_time)}
									</Text>
								</View>
								<View style={styles.infoRow}>
									<Ionicons
										name="ticket-outline"
										size={13}
										color="#666"
									/>
									<Text style={styles.infoText}>
										Row {item.row_label}, Seat{" "}
										{item.column_number}
									</Text>
								</View>
							</View>

							<View style={styles.cardFooter}>
								<Text style={styles.price}>
									€{Number(item.price).toFixed(2)}
								</Text>
								{item.status !== "CANCELLED" && (
									<TouchableOpacity
										style={styles.cancelButton}
										onPress={() =>
											handleCancel(item.reservation_id)
										}
									>
										<Text style={styles.cancelText}>
											Cancel
										</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>
					)}
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
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 10,
	},
	emptyTitle: {
		color: "#555",
		fontSize: 17,
		fontWeight: "600",
	},
	emptySubtitle: {
		color: "#444",
		fontSize: 13,
	},
	listContent: {
		padding: 16,
	},
	card: {
		backgroundColor: "#161616",
		borderRadius: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#222",
		overflow: "hidden",
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#222",
	},
	showTitle: {
		color: "#E8E8E8",
		fontSize: 16,
		fontWeight: "700",
		flex: 1,
		marginRight: 10,
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 20,
	},
	statusText: {
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	cardBody: {
		padding: 16,
		gap: 8,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	infoText: {
		color: "#888",
		fontSize: 13,
	},
	cardFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderTopWidth: 1,
		borderTopColor: "#222",
	},
	price: {
		color: "#8B0000",
		fontSize: 17,
		fontWeight: "700",
	},
	cancelButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#8B0000",
	},
	cancelText: {
		color: "#8B0000",
		fontSize: 13,
		fontWeight: "600",
	},
});
