import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

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

    const [seats, setSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        async function fetchSeats() {
            try {
                const token = await SecureStore.getItemAsync("userToken");
                const res = await axios.get(
                    `${process.env.EXPO_PUBLIC_API_URL}/shows/showtimes/${showtime_id}/seats`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSeats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchSeats();
    }, [showtime_id]);

    // BOOKING HANDLER

    const handleBook = async () => {
        if (!selectedSeat) return;

        Alert.alert(
            "Confirm Booking",
            `Seat ${selectedSeat.row_label}${selectedSeat.column_number} for ${title}\n${date} at ${time}\n\nPrice: €${Number(price).toFixed(2)}`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Book Now",
                    onPress: async () => {
                        setBooking(true);
                        try {
                            const token =
                                await SecureStore.getItemAsync("userToken");

                            const createRes = await axios.post(
                                `${process.env.EXPO_PUBLIC_API_URL}/reservations`,
                                {
                                    showtime_id: Number(showtime_id),
                                    seat_id: selectedSeat.seat_id,
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            const reservationId =
                                createRes.data.reservation_id;

                            await axios.put(
                                `${process.env.EXPO_PUBLIC_API_URL}/reservations/${reservationId}`,
                                {},
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            Alert.alert(
                                "Booking Confirmed",
                                `Your seat ${selectedSeat.row_label}${selectedSeat.column_number} has been booked successfully.`,
                                [
                                    {
                                        text: "View Bookings",
                                        onPress: () =>
                                            router.push("/(tabs)/profile"),
                                    },
                                    {
                                        text: "Done",
                                        onPress: () => router.back(),
                                    },
                                ]
                            );
                        } catch (err: any) {
                            Alert.alert(
                                "Booking Failed",
                                err.response?.data?.error ||
                                    "Something went wrong"
                            );
                        } finally {
                            setBooking(false);
                        }
                    },
                },
            ]
        );
    };

    const rows = groupByRow(seats);

    // RENDER

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: title as string,
                    headerTintColor: "#FFFFFF",
                    headerStyle: { backgroundColor: "#121212" },
                    headerShadowVisible: false,
                }}
            />

            {/* FLOATING INFO CARD */}
            <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                    <Ionicons name="business" size={16} color="#B0B0B0" />
                    <Text style={styles.infoText} numberOfLines={1}>{theater_name}</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                    <Ionicons name="calendar" size={16} color="#B0B0B0" />
                    <Text style={styles.infoText}>{date}</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                    <Ionicons name="time" size={16} color="#B0B0B0" />
                    <Text style={styles.infoText}>{time}</Text>
                </View>
            </View>

            {/* STAGE AREA */}
            <View style={styles.stageContainer}>
                <View style={styles.stageGlow}>
                    <Text style={styles.stageText}>SCREEN</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#A10000" />
                </View>
            ) : (
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.seatGrid}
                >
                    {rows.map(({ row, seats: rowSeats }) => (
                        <View key={row} style={styles.seatRow}>
                            <Text style={styles.rowLabel}>{row}</Text>
                            {rowSeats.map((seat) => {
                                const available = Boolean(seat.is_available);
                                const selected =
                                    selectedSeat?.seat_id === seat.seat_id;
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
                                            setSelectedSeat(
                                                selected ? null : seat
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
                                            {seat.column_number}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                            {/* Empty space to balance the row label */}
                            <View style={{ width: 20 }} /> 
                        </View>
                    ))}

                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.seat]} />
                            <Text style={styles.legendText}>Available</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[styles.legendDot, styles.seatSelected]}
                            />
                            <Text style={styles.legendText}>Selected</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View
                                style={[styles.legendDot, styles.seatTaken]}
                            />
                            <Text style={styles.legendText}>Taken</Text>
                        </View>
                    </View>
                </ScrollView>
            )}

            {/* FLOATING BOOKING BAR */}
            {selectedSeat && (
                <View style={styles.bookingBarContainer}>
                    <View style={styles.bookingBar}>
                        <View style={styles.bookingDetails}>
                            <Text style={styles.bookingBarLabel}>Selected Seat</Text>
                            <Text style={styles.bookingBarSeat}>
                                Row {selectedSeat.row_label} - {selectedSeat.column_number}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.bookButton,
                                booking && styles.bookButtonDisabled,
                            ]}
                            onPress={handleBook}
                            disabled={booking}
                        >
                            {booking ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <View style={styles.bookButtonInner}>
                                    <Text style={styles.bookButtonText}>Book</Text>
                                    <Text style={styles.bookButtonPrice}>€{Number(price).toFixed(2)}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// STYLES

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212", // Deeper cinematic black
    },
    infoCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1E1E1E",
        marginHorizontal: 16,
        marginVertical: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        gap: 6,
    },
    infoDivider: {
        width: 1,
        height: 20,
        backgroundColor: "#333",
    },
    infoText: {
        color: "#D0D0D0",
        fontSize: 12,
        fontWeight: "500",
    },
    stageContainer: {
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 30,
    },
    stageGlow: {
        width: "75%",
        height: 30,
        backgroundColor: "#1E1E1E",
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 2,
        borderTopColor: "#A10000",
        // Glow effect
        shadowColor: "#A10000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    stageText: {
        color: "#A10000",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 6,
        opacity: 0.8,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    seatGrid: {
        paddingHorizontal: 10,
        paddingBottom: 140, // Extra padding for the floating bar
        alignItems: "center",
        gap: 12,
    },
    seatRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    rowLabel: {
        color: "#666",
        fontSize: 14,
        fontWeight: "700",
        width: 20,
        textAlign: "center",
    },
    seat: {
        width: 36,
        height: 36,
        borderTopLeftRadius: 12, // Looks more like a theater seat
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: "#2A2A35",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#3D3D45",
    },
    seatSelected: {
        backgroundColor: "#A10000",
        borderColor: "#FF3333",
        transform: [{ scale: 1.05 }],
        shadowColor: "#A10000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    seatTaken: {
        backgroundColor: "#181818",
        borderColor: "#222",
        opacity: 0.5,
    },
    seatText: {
        color: "#A0A0A0",
        fontSize: 11,
        fontWeight: "700",
    },
    seatTextSelected: {
        color: "#FFFFFF",
    },
    seatTextTaken: {
        color: "#444",
    },
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 24,
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#222",
        width: "80%",
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    legendDot: {
        width: 16,
        height: 16,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
    },
    legendText: {
        color: "#888",
        fontSize: 12,
        fontWeight: "500",
    },
    bookingBarContainer: {
        position: "absolute",
        bottom: Platform.OS === 'ios' ? 30 : 20,
        left: 16,
        right: 16,
    },
    bookingBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(30, 30, 30, 0.95)",
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#333",
        // Heavy shadow to float above content
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    bookingDetails: {
        flex: 1,
    },
    bookingBarLabel: {
        color: "#888",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
    },
    bookingBarSeat: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
    },
    bookButton: {
        backgroundColor: "#A10000",
        borderRadius: 10,
        minWidth: 120,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    bookButtonDisabled: {
        opacity: 0.7,
    },
    bookButtonInner: {
        alignItems: "center",
    },
    bookButtonText: {
        color: "#FFF",
        fontWeight: "800",
        fontSize: 14,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    bookButtonPrice: {
        color: "#FFD0D0",
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
    },
});