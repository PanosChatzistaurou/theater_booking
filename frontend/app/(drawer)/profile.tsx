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
                name: name || "GUEST USER",
                email: email || "no email found",
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
        <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
            <View style={styles.hero}>
                <View style={styles.heroAccent} />
                <View style={styles.avatarRing}>
                    <Text style={styles.avatarInitial}>
                        {userData.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.userName}>{userData.name.toUpperCase()}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionLabel}>ACCOUNT</Text>

                <TouchableOpacity
                    style={styles.row}
                    onPress={() => router.push("/bookings")}
                    activeOpacity={0.7}
                >
                    <View style={styles.rowIcon}>
                        <Ionicons name="ticket-outline" size={18} color="#8B0000" />
                    </View>
                    <View style={styles.rowBody}>
                        <Text style={styles.rowTitle}>MY BOOKINGS</Text>
                        <Text style={styles.rowSub}>View and manage reservations</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={14} color="#8B0000" />
                </TouchableOpacity>

                <View style={styles.separator} />

                <TouchableOpacity
                    style={styles.logoutRow}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={16} color="#8B0000" />
                    <Text style={styles.logoutText}>SIGN OUT</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// STYLES

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0D0D0D" },
    scroll: { flexGrow: 1 },
    hero: {
        backgroundColor: "#8B0000",
        paddingTop: 48,
        paddingBottom: 32,
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
    },
    heroAccent: {
        position: "absolute",
        right: -60,
        top: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "rgba(0,0,0,0.12)",
    },
    avatarRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.2)",
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    avatarInitial: {
        color: "#FFF",
        fontSize: 32,
        fontWeight: "900",
        letterSpacing: -1,
    },
    userName: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: 2,
        marginBottom: 6,
    },
    userEmail: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 12,
        fontWeight: "500",
        letterSpacing: 0.5,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    sectionLabel: {
        color: "#2A2A2A",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 3,
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 4,
    },
    rowIcon: {
        width: 36,
        height: 36,
        borderRadius: 4,
        backgroundColor: "#161616",
        borderWidth: 1,
        borderColor: "#1A1A1A",
        justifyContent: "center",
        alignItems: "center",
    },
    rowBody: { flex: 1 },
    rowTitle: {
        color: "#E8E8E8",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 2,
        marginBottom: 3,
    },
    rowSub: {
        color: "#333",
        fontSize: 11,
        fontWeight: "500",
    },
    separator: {
        height: 1,
        backgroundColor: "#161616",
        marginVertical: 20,
    },
    logoutRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 4,
    },
    logoutText: {
        color: "#8B0000",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 2,
    },
});
