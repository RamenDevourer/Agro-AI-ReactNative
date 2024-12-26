import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";


const HomeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cropData, setCropData] = useState([]);
  const [location, setLocation] = useState(null); // State for location
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
    
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData !== null) {
          setUserData(JSON.parse(storedUserData));
        }

        // Fetch crop data
        const storedCropData = await AsyncStorage.getItem("cropData");
        if (storedCropData !== null) {
          setCropData(JSON.parse(storedCropData));
        }

        // Get Location Permission and fetch location
        await getLocationPermission();
      } catch (error) {
        console.error("Error fetching data from AsyncStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLocationPermission = async () => {
    try {
      const storedLocation = await AsyncStorage.getItem("userLocation");

      if (storedLocation !== null) {
        setLocation(JSON.parse(storedLocation));
        console.log("Location already stored");
        return;
      }

      if (locationPermission?.status !== "granted") {
        console.log("Requesting location permission...");
        const permissionResponse = await requestLocationPermission();
        console.log("Location permission response:", permissionResponse);

        if (permissionResponse.granted) {
          await getCurrentLocation();
        } else {
          console.log("Location permission denied");
          // Handle the case where location permission is denied (e.g., show a message)
          setLocation("Location not available");
        }
      } else {
        console.log("Location permission already granted");
        await getCurrentLocation();
      }
    } catch (error) {
      console.error("Error handling location permission:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { coords } = await Location.getCurrentPositionAsync({});
      let regionName = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      const locationString = `${regionName[0].city}, ${regionName[0].region}`;
      setLocation(locationString);
      await AsyncStorage.setItem("userLocation", JSON.stringify(locationString));
    } catch (error) {
      console.error("Error getting current location:", error);
      // Handle location error (e.g., set a default location or show an error message)
      setLocation("Location not available");
    }
  };

  const calculateGrowthPercentage = (dateCreated, cropName) => {
    const createdDate = new Date(dateCreated);
    const today = new Date();
    const differenceInTime = today.getTime() - createdDate.getTime();
    const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));

    const selectedCrop = cropData.find((crop) => crop.name === cropName);
    if (selectedCrop) {
      const growthPercentage = Math.min(
        100,
        Math.round((differenceInDays / selectedCrop.harvestDuration) * 100)
      );
      return growthPercentage;
    } else {
      return 0; // Default if crop not found in cropData
    }
  };

  const getIrrigationStatus = (dateCreated, cropName) => {
    const createdDate = new Date(dateCreated);
    const today = new Date();
    const differenceInTime = today.getTime() - createdDate.getTime();
    const differenceInDays = Math.round(differenceInTime / (1000 * 3600 * 24));

    const selectedCrop = cropData.find((crop) => crop.name === cropName);
    if (selectedCrop) {
      const irrigationFrequency = selectedCrop.irrigationFrequency;
      if (differenceInDays % irrigationFrequency === 0) {
        return "Irrigate today";
      } else {
        const daysUntilNextIrrigation =
          irrigationFrequency - (differenceInDays % irrigationFrequency);
        return `Irrigate in ${daysUntilNextIrrigation} days`;
      }
    } else {
      return "Irrigation info not available";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
          <Text style={styles.loadingText}>Loading user data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return null; // Or a "No data found" message
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back 👋</Text>
            <View style={styles.locationContainer}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#2D6A4F" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <FontAwesome5 name="user-circle" size={32} color="#2D6A4F" />
          </TouchableOpacity>
        </View>

        {/* Weather Summary */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherInfo}>
            <FontAwesome5 name="sun" size={24} color="#FDB813" />
            <View style={styles.weatherDetails}>
              <Text style={styles.temperature}>32°C</Text>
              <Text style={styles.weatherDescription}>Sunny</Text>
            </View>
          </View>
          <Text style={styles.weatherAdvice}>
            Perfect day for crop inspection!
          </Text>
        </View>

        {/* Current Crops Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Current Crops</Text>
          {userData?.crops &&
            userData.crops.map((crop, index) => {
              const growthPercentage = calculateGrowthPercentage(
                crop.dateCreated,
                crop.cropName
              );
              const irrigationStatus = getIrrigationStatus(
                crop.dateCreated,
                crop.cropName
              );

              return (
                <View key={index} style={styles.cropCard}>
                  <View style={styles.cropHeader}>
                    <Text style={styles.cropName}>{crop.cropName}</Text>
                    <Text
                      style={[
                        styles.cropStatus,
                        {
                          color: irrigationStatus.includes("today")
                            ? "#1E90FF"
                            : "#2D6A4F",
                        },
                      ]}
                    >
                      {irrigationStatus}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${growthPercentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {growthPercentage}% Growth
                  </Text>
                </View>
              );
            })}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="calendar-plus" size={20} color="#2D6A4F" />
            <Text style={styles.actionText}>Add Crop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="clipboard-list" size={20} color="#2D6A4F" />
            <Text style={styles.actionText}>To-Do</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ... (Rest of your styles)
const styles = StyleSheet.create({
  // ... (Other styles remain the same)
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4B5563",
  },
  profileButton: {
    padding: 4,
  },
  weatherCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  weatherInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherDetails: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  weatherDescription: {
    fontSize: 14,
    color: "#4B5563",
  },
  weatherAdvice: {
    marginTop: 8,
    fontSize: 14,
    color: "#059669",
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  cropCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
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
  cropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cropName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  cropStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2D6A4F",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#E7F3EF",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    width: "48%",
  },
  actionText: {
    color: "#2D6A4F",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default HomeScreen;