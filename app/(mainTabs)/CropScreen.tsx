import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from 'expo-router';

export default function CropMonitoringScreen() {
  const [userData, setUserData] = useState(null);
  const [cropData, setCropData] = useState([]);
  const [currentSeason, setCurrentSeason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        const storedCropData = await AsyncStorage.getItem("cropData");

        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
        if (storedCropData) {
          setCropData(JSON.parse(storedCropData));
        }
      } catch (error) {
        console.error("Error fetching data from AsyncStorage:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Determine the current season based on the current month
    const currentMonth = new Date().getMonth() + 1; // Adding 1 because getMonth() is zero-based (0-11)

    if (currentMonth >= 7 && currentMonth <= 10) {
      setCurrentSeason("Kharif");
    } else if (currentMonth >= 11 || currentMonth <= 3) {
      setCurrentSeason("Rabi");
    } else if (currentMonth >= 4 && currentMonth <= 6) {
      setCurrentSeason("Zaid");
    }
  }, []);

  const getDaysRemaining = (dateCreated, harvestDuration) => {
    const createdDate = new Date(dateCreated);
    const harvestDate = new Date(
      createdDate.getTime() + harvestDuration * 24 * 60 * 60 * 1000
    );
    const today = new Date();
    const differenceInTime = harvestDate.getTime() - today.getTime();
    const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));

    return differenceInDays > 0 ? differenceInDays : 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Crop Monitoring</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <FontAwesome5 name="calendar-alt" size={20} color="#2D6A4F" />
          </TouchableOpacity>
        </View>

        {/* Season Selection */}
        <View style={styles.seasonContainer}>
          <TouchableOpacity
            style={[
              styles.seasonButton,
              currentSeason === "Kharif" && styles.seasonButtonActive,
            ]}
          >
            <Text
              style={[
                styles.seasonText,
                currentSeason === "Kharif" && styles.seasonTextActive,
              ]}
            >
              Kharif
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.seasonButton,
              currentSeason === "Rabi" && styles.seasonButtonActive,
            ]}
          >
            <Text
              style={[
                styles.seasonText,
                currentSeason === "Rabi" && styles.seasonTextActive,
              ]}
            >
              Rabi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.seasonButton,
              currentSeason === "Zaid" && styles.seasonButtonActive,
            ]}
          >
            <Text
              style={[
                styles.seasonText,
                currentSeason === "Zaid" && styles.seasonTextActive,
              ]}
            >
              Zaid
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions (Moved above Current Crops) */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#2D6A4F" }]}
            onPress={() => router.replace("/(CropScreenTabs)/AddCrop")}
          >
            <FontAwesome5 name="plus" size={18} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, { color: "#FFFFFF" }]}>
              Add New Crop
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: "#E7F3EF", borderColor: "#2D6A4F", borderWidth: 1 },
            ]}
          >
            <FontAwesome5 name="history" size={18} color="#2D6A4F" />
            <Text style={[styles.actionButtonText, { color: "#2D6A4F" }]}>
              Crop History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Crops */}
        <View style={styles.currentCropsContainer}>
          <Text style={styles.sectionTitle}>Current Crops</Text>
          <Text style={styles.sectionSubtitle}>
            Your active crops and their status
          </Text>

          {userData?.crops &&
            userData.crops.map((userCrop, index) => {
              const matchingCropData = cropData.find(
                (c) => c.name === userCrop.cropName
              );
              const daysRemaining = matchingCropData
                ? getDaysRemaining(
                    userCrop.dateCreated,
                    matchingCropData.harvestDuration
                  )
                : null;

              return (
                <Link
                    href={{
                        pathname: "/(CropScreenTabs)/CropDetailsScreen",
                        params: {
                        cropName: userCrop.cropName,
                        dateCreated: userCrop.dateCreated,
                        },
                    }}
                    key={index}
                    style={styles.cropCard} // Apply the same style as TouchableOpacity
                    asChild // Important to pass the style to TouchableOpacity
                    >
                <TouchableOpacity key={index} style={styles.cropCard}>
                  <View style={styles.cropIconContainer}>
                    <FontAwesome5 name="seedling" size={24} color="#2D6A4F" />
                  </View>
                  <View style={styles.cropInfo}>
                    <Text style={styles.cropName}>{userCrop.cropName}</Text>
                    <View style={styles.cropMetrics}>
                      {daysRemaining !== null && (
                        <View style={styles.metricItem}>
                          <FontAwesome5
                            name="clock"
                            size={12}
                            color="#6B7280"
                          />
                          <Text style={styles.metricText}>
                            {daysRemaining} days remaining
                          </Text>
                        </View>
                      )}
                      {matchingCropData && (
                        <View style={styles.metricItem}>
                          <FontAwesome5 name="tint" size={12} color="#6B7280" />
                          <Text style={styles.metricText}>
                            {matchingCropData.waterNeeds} water needs
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <FontAwesome5
                    name="chevron-right"
                    size={16}
                    color="#6B7280"
                  />
                </TouchableOpacity>
                </Link>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  calendarButton: {
    padding: 8,
    backgroundColor: "#E7F3EF",
    borderRadius: 8,
  },
  seasonContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  seasonButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  seasonButtonActive: {
    backgroundColor: "#2D6A4F",
    borderColor: "#2D6A4F",
  },
  seasonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  seasonTextActive: {
    color: "#FFFFFF",
  },
  currentCropsContainer: {
    // Container for Current Crops
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  cropCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cropIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#E7F3EF",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  cropMetrics: {
    flexDirection: "row",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metricText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  actionsContainer: {
    // Container for Quick Actions
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16, // Reduced bottom margin
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
