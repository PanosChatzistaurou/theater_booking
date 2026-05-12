import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { api, getApiError } from "../utils/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// TYPES

interface Seat {
	seat_id: number;
	row_label: string;
	column_number: number;
	price: string;
	is_available: boolean | number;
}

interface GroupedRow {
	row: string;
	seats: Seat[];
}

// HELPERS

function groupByRow(seats: Seat[]): GroupedRow[] {
	const map: Record<string, Seat[]> = {};
	for (const seat of seats) {
		if (!map[seat.row_label]) map[seat.row_label] = [];
		map[seat.row_label].push(seat);
	}
	return Object.entries(map)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([row, seats]) => ({ row, seats }));
}

// COMPONENT

export default function ShowtimeDetailsScreen() {
	const { showtime_id, title, date, time, price, theater_name } =
		useLocalSearchParams();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [seats, setSeats] = useState<Seat[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
	const [booking, setBooking] = useState(false);

	useEffect(() => {
		async function fetchSeats() {
			try {
				const res = await api.get(
					`/shows/showtimes/${showtime_id}/seats`,
				);
				setSeats(res.data);
			} catch (err: unknown) {
				Alert.alert("Error", getApiError(err));
			} finally {
				setLoading(false);
			}
		}
		fetchSeats();
	}, [showtime_id]);

	// BOOKING HANDLER

	const handleBook = async () => {
		if (selectedSeats.length === 0) return;

		const totalAmount = (Number(price) * selectedSeats.length).toFixed(2);
		const seatLabels = selectedSeats
			.map((s) => `${s.row_label}${s.column_number}`)
			.join(", ");

		Alert.alert(
			"CONFIRM BOOKING",
			`${title}\n${date}  ·  ${time}\nSeats: ${seatLabels}  ·  €${totalAmount}`,
			[
				{ text: "CANCEL", style: "cancel" },
				{
					text: "CONFIRM",
					onPress: async () => {
						setBooking(true);
						try {
							await Promise.all(
								selectedSeats.map((seat) =>
									api.post("/reservations", {
										showtime_id: Number(showtime_id),
										seat_id: seat.seat_id,
									}),
								),
							);
							Alert.alert(
								"BOOKING CONFIRMED",
								`Seats ${seatLabels} are yours.`,
								[
									{
										text: "MY BOOKINGS",
										onPress: () =>
											router.push("/(drawer)/profile"),
									},
									{
										text: "DONE",
										onPress: () => router.back(),
									},
								],
							);
						} catch (err: unknown) {
							Alert.alert("Error", getApiError(err));
						} finally {
							setBooking(false);
						}
					},
				},
			],
		);
	};

	const rows = groupByRow(seats);

	// RENDER

	return (
		<View style={styles.container}>
			<Stack.Screen
				options={{
					headerShown: true,
					title: "",
					headerTintColor: "#E8E8E8",
					headerStyle: { backgroundColor: "#0D0D0D" },
					headerShadowVisible: false,
				}}
			/>

			<View style={styles.hero}>
				<View style={styles.heroAccent} />
				<Text style={styles.heroLabel}>NOW PLAYING</Text>
				<Text style={styles.heroTitle}>
					{(title as string).toUpperCase()}
				</Text>
				<View style={styles.heroMeta}>
					<Text style={styles.heroMetaText}>
						{theater_name as string}
					</Text>
					<Text style={styles.heroMetaDot}>·</Text>
					<Text style={styles.heroMetaText}>{date}</Text>
					<Text style={styles.heroMetaDot}>·</Text>
					<Text style={styles.heroMetaText}>{time}</Text>
				</View>
			</View>

			<View style={styles.stageWrap}>
				<View style={styles.stageLine} />
				<Text style={styles.stageLabel}>STAGE</Text>
				<View style={styles.stageLine} />
			</View>

			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#8B0000" />
				</View>
			) : (
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<ScrollView contentContainerStyle={styles.seatGrid}>
						{rows.map(({ row, seats: rowSeats }) => (
							<View key={row} style={styles.seatRow}>
								{rowSeats.map((seat) => {
									const available = Boolean(
										seat.is_available,
									);
									const selected = selectedSeats.some(
										(s) => s.seat_id === seat.seat_id,
									);
									return (
										<TouchableOpacity
											key={seat.seat_id}
											style={[
												styles.seat,
												!available && styles.seatTaken,
												selected && styles.seatSelected,
											]}
											disabled={!available}
											onPress={() =>
												setSelectedSeats((prev) =>
													selected
														? prev.filter(
																(s) =>
																	s.seat_id !==
																	seat.seat_id,
															)
														: [...prev, seat],
												)
											}
											activeOpacity={0.7}
										>
											<Text
												style={[
													styles.seatText,
													!available &&
														styles.seatTextTaken,
													selected &&
														styles.seatTextSelected,
												]}
											>
												{seat.row_label}
												{seat.column_number}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						))}

						<View style={styles.legend}>
							<View style={styles.legendItem}>
								<View
									style={[
										styles.legendDot,
										{
											backgroundColor: "#1A1A1A",
											borderColor: "#2A2A2A",
										},
									]}
								/>
								<Text style={styles.legendText}>AVAILABLE</Text>
							</View>
							<View style={styles.legendItem}>
								<View
									style={[
										styles.legendDot,
										{ backgroundColor: "#8B0000" },
									]}
								/>
								<Text style={styles.legendText}>SELECTED</Text>
							</View>
							<View style={styles.legendItem}>
								<View
									style={[
										styles.legendDot,
										{
											backgroundColor: "#0D0D0D",
											borderColor: "#111",
										},
									]}
								/>
								<Text style={styles.legendText}>TAKEN</Text>
							</View>
						</View>
					</ScrollView>
				</ScrollView>
			)}

			{selectedSeats.length > 0 && (
				<View
					style={[
						styles.bookingBar,
						{ paddingBottom: Math.max(insets.bottom + 16, 32) },
					]}
				>
					<View>
						<Text style={styles.bookingBarLabel}>
							SELECTED SEATS
						</Text>
						<Text style={styles.bookingBarSeat}>
							{selectedSeats
								.map((s) => `${s.row_label}${s.column_number}`)
								.join(", ")}
						</Text>
					</View>
					<TouchableOpacity
						style={[
							styles.bookButton,
							booking && styles.bookButtonDisabled,
						]}
						onPress={handleBook}
						disabled={booking}
						activeOpacity={0.85}
					>
						{booking ? (
							<ActivityIndicator size="small" color="#FFF" />
						) : (
							<Text style={styles.bookButtonText}>
								BOOK €
								{(Number(price) * selectedSeats.length).toFixed(
									2,
								)}
							</Text>
						)}
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
}

// STYLES

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#0D0D0D" },
	hero: {
		backgroundColor: "#8B0000",
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 24,
		position: "relative",
		overflow: "hidden",
	},
	heroAccent: {
		position: "absolute",
		right: -40,
		bottom: -40,
		width: 160,
		height: 160,
		borderRadius: 80,
		backgroundColor: "rgba(0,0,0,0.15)",
	},
	heroLabel: {
		color: "rgba(255,255,255,0.4)",
		fontSize: 10,
		fontWeight: "800",
		letterSpacing: 4,
		marginBottom: 6,
	},
	heroTitle: {
		color: "#FFF",
		fontSize: 22,
		fontWeight: "900",
		letterSpacing: 1,
		marginBottom: 10,
	},
	heroMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		flexWrap: "wrap",
	},
	heroMetaText: {
		color: "rgba(255,255,255,0.55)",
		fontSize: 11,
		fontWeight: "600",
	},
	heroMetaDot: {
		color: "rgba(255,255,255,0.25)",
		fontSize: 11,
	},
	stageWrap: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 20,
		marginTop: 20,
		marginBottom: 16,
		gap: 10,
	},
	stageLine: { flex: 1, height: 1, backgroundColor: "#1A1A1A" },
	stageLabel: {
		color: "#2A2A2A",
		fontSize: 10,
		fontWeight: "800",
		letterSpacing: 4,
	},
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	seatGrid: {
		paddingBottom: 120,
		paddingHorizontal: 16,
		gap: 8,
	},
	seatRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	rowLabel: {
		color: "#2A2A2A",
		fontSize: 11,
		fontWeight: "800",
		width: 16,
		textAlign: "center",
		letterSpacing: 0.5,
	},
	seat: {
		minWidth: 36,
		height: 32,
		paddingHorizontal: 4,
		borderRadius: 4,
		backgroundColor: "#1A1A1A",
		borderWidth: 1,
		borderColor: "#2A2A2A",
		justifyContent: "center",
		alignItems: "center",
	},
	seatSelected: {
		backgroundColor: "#8B0000",
		borderColor: "#8B0000",
	},
	seatTaken: {
		backgroundColor: "#0D0D0D",
		borderColor: "#111",
	},
	seatText: { color: "#444", fontSize: 10, fontWeight: "700" },
	seatTextSelected: { color: "#FFF" },
	seatTextTaken: { color: "#1A1A1A" },
	legend: {
		flexDirection: "row",
		gap: 20,
		marginTop: 20,
	},
	legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
	legendDot: {
		width: 12,
		height: 12,
		borderRadius: 2,
		borderWidth: 1,
		borderColor: "transparent",
	},
	legendText: {
		color: "#333",
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 1.5,
	},
	bookingBar: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#0D0D0D",
		borderTopWidth: 1,
		borderTopColor: "#8B0000",
		paddingHorizontal: 24,
		paddingTop: 16,
	},
	bookingBarLabel: {
		color: "#333",
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 2,
		marginBottom: 4,
	},
	bookingBarSeat: {
		color: "#E8E8E8",
		fontSize: 22,
		fontWeight: "900",
		letterSpacing: 2,
	},
	bookButton: {
		backgroundColor: "#8B0000",
		paddingHorizontal: 24,
		paddingVertical: 14,
		borderRadius: 4,
		minWidth: 150,
		alignItems: "center",
	},
	bookButtonDisabled: { opacity: 0.5 },
	bookButtonText: {
		color: "#FFF",
		fontWeight: "900",
		fontSize: 12,
		letterSpacing: 2.5,
	},
});
