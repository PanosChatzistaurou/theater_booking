import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";

// COMPONENT

export default function ProfileScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState({ name: "", email: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const name = await SecureStore.getItemAsync("userName");
            const email = await SecureStore.getItemAsync("userEmail");
            setUserData({
                name: name || "Guest User",
                email: email || "No email found",
            });
            setLoading(false);
        }
        loadUser();
    }, []);

    // LOGOUT HANDLER

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userName");
        await SecureStore.deleteItemAsync("userEmail");
        router.replace("/(auth)/login");
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center" }]}>
                <ActivityIndicator size="large" color="#8B0000" />
            </View>
        );
    }

    // RENDER

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={52} color="#E8E8E8" />
                </View>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionLabel}>Account</Text>

                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => router.push("/bookings")}
                    activeOpacity={0.75}
                >
                    <View style={styles.optionIconContainer}>
                        <Ionicons
                            name="ticket-outline"
                            size={20}
                            color="#8B0000"
                        />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>My Bookings</Text>
                        <Text style={styles.optionSubtitle}>
                            View and manage your reservations
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#555"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={18}
                        color="#FFF"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.logoutButtonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// STYLES

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
    },
    header: {
        backgroundColor: "#8B0000",
        paddingTop: 50,
        paddingBottom: 30,
        alignItems: "center",
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#2C2C2C",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.15)",
    },
    userName: {
        color: "#E8E8E8",
        fontSize: 20,
        fontWeight: "700",
    },
    userEmail: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 13,
        marginTop: 4,
    },
    content: {
        padding: 20,
    },
    sectionLabel: {
        color: "#8B0000",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2C2C2C",
        padding: 16,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#3D3D3D",
    },
    optionIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 8,
        backgroundColor: "#1E1E1E",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        color: "#E8E8E8",
        fontSize: 15,
        fontWeight: "600",
    },
    optionSubtitle: {
        color: "#666",
        fontSize: 12,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: "row",
        backgroundColor: "#8B0000",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
        marginBottom: 40,
    },
    logoutButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 15,
    },
});