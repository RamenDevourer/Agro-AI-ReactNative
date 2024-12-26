import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { router } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddCrop() {
  // ... (Your existing state variables and useEffect remain the same)
  const [cropName, setCropName] = useState("");
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
  const [mapRegion, setMapRegion] = useState(null);
  const [initialMapRegion, setInitialMapRegion] = useState(null);
  const [availableCrops, setAvailableCrops] = useState([]);

  useEffect(() => {
    // ... existing code in useEffect remains same
    const getLocationPermission = async () => {
      if (locationPermission?.status !== "granted") {
        console.log("Requesting location permission...");
        const permissionResponse = await requestLocationPermission();
        console.log("Location permission response:", permissionResponse);
      } else {
        console.log("Location permission already granted");
      }
    };

    const getCurrentLocation = async () => {
      try {
        let { coords } = await Location.getCurrentPositionAsync({});
        setMapRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setInitialMapRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error("Error getting current location:", error);
        Alert.alert(
          "Error",
          "Failed to get current location. Please make sure location services are enabled."
        );
      }
    };

    const loadCropData = async () => {
      try {
        const storedCropData = await AsyncStorage.getItem("cropData");
        if (storedCropData !== null) {
          const crops = JSON.parse(storedCropData);
          setAvailableCrops(crops);
        } else {
          console.log("No crop data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error loading crop data:", error);
      }
    };

    getLocationPermission();
    getCurrentLocation();
    loadCropData();
  }, [locationPermission]);

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setMapRegion({
      ...mapRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  const handleAddCrop = async () => {
    // ... (Your existing logic for creating newCrop remains the same)
    if (!cropName || !mapRegion) {
      Alert.alert("Error", "Please select a crop and location.");
      return;
    }

    const newCrop = {
      cropName: cropName,
      cropLocation: {
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      },
      dateCreated: new Date().toISOString(),
    };

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);

    try {
      // Update Firestore
      await updateDoc(userDocRef, {
        crops: arrayUnion(newCrop),
      });

      // Update AsyncStorage
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        const updatedUserData = {
          ...userData,
          crops: [...userData.crops, newCrop],
        };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
      }

      Alert.alert("Success", `Crop ${cropName} added successfully!`);
      router.replace("/(mainTabs)/HomeScreen");
    } catch (error) {
      console.error("Error adding crop:", error);
      Alert.alert("Error", "Failed to add crop.");
    }
  };

  return (
    // ... (Your AddCrop component's UI remains the same)
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Add New Crop</Text>

      {/* Dropdown for Crop Selection */}
      <Picker
        style={styles.picker}
        selectedValue={cropName}
        onValueChange={(itemValue) => setCropName(itemValue)}
      >
        <Picker.Item label="Select a Crop" value="" />
        {availableCrops.map((crop) => (
          <Picker.Item key={crop.name} label={crop.name} value={crop.name} />
        ))}
      </Picker>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={initialMapRegion}
          onRegionChangeComplete={setMapRegion}
          onPress={handleMapPress}
        >
          {mapRegion && (
            <Marker coordinate={mapRegion} title="Selected Location" />
          )}
        </MapView>
      </View>

      {/* Add Crop Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddCrop}>
        <Text style={styles.addButtonText}>Add Crop</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ... (Your styles remain the same)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#2D6A4F",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  mapContainer: {
    height: 500,
    width: "100%",
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
});