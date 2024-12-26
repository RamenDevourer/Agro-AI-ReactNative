import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function CropDetailsScreen() {
  const params = useLocalSearchParams();
  const { cropName, dateCreated } = params;

  const [cropDetails, setCropDetails] = useState(null);
  const [cropData, setCropData] = useState([]);

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        const storedCropData = await AsyncStorage.getItem("cropData");

        if (storedUserData && storedCropData) {
          const userData = JSON.parse(storedUserData);
          const allCropData = JSON.parse(storedCropData);

          setCropData(allCropData);

          // Find the specific crop based on cropName and dateCreated
          const selectedCrop = userData.crops.find(
            (crop) =>
              crop.cropName === cropName && crop.dateCreated === dateCreated
          );
          setCropDetails(selectedCrop);
        }
      } catch (error) {
        console.error("Error fetching data from AsyncStorage:", error);
      }
    };

    fetchCropDetails();
  }, [cropName, dateCreated]);

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

  const getDaysUntilNextIrrigation = (dateCreated, irrigationFrequency) => {
    const createdDate = new Date(dateCreated);
    const today = new Date();
    const differenceInDays = Math.floor(
      (today.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)
    );
    const daysSinceLastIrrigation = differenceInDays % irrigationFrequency;
    const daysUntilNextIrrigation =
      irrigationFrequency - daysSinceLastIrrigation;

    return daysUntilNextIrrigation;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  if (!cropDetails) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading crop details...</Text>
      </SafeAreaView>
    );
  }

  const matchingCrop = cropData.find((c) => c.name === cropDetails.cropName);
  const harvestDuration = matchingCrop ? matchingCrop.harvestDuration : 0;
  const daysRemaining = getDaysRemaining(
    cropDetails.dateCreated,
    harvestDuration
  );
  const irrigationFrequency = matchingCrop
    ? matchingCrop.irrigationFrequency
    : null;
  const daysUntilNextIrrigation = irrigationFrequency
    ? getDaysUntilNextIrrigation(cropDetails.dateCreated, irrigationFrequency)
    : null;

  const plantedDate = formatDate(cropDetails.dateCreated);
  const estimatedHarvestDate = formatDate(
    new Date(
      new Date(cropDetails.dateCreated).getTime() +
        harvestDuration * 24 * 60 * 60 * 1000
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.cropName}>{cropDetails.cropName}</Text>
        </View>

        {/* Google Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: cropDetails.cropLocation.latitude,
              longitude: cropDetails.cropLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: cropDetails.cropLocation.latitude,
                longitude: cropDetails.cropLocation.longitude,
              }}
              title={cropDetails.cropName}
            />
          </MapView>
        </View>

        {/* Important Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Details</Text>
          <View style={styles.detailRow}>
            <FontAwesome5 name="calendar-check" size={16} color="#2D6A4F" />
            <Text style={styles.detailText}>
              Harvesting: {daysRemaining} days remaining
            </Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome5 name="tint" size={16} color="#2D6A4F" />
            <Text style={styles.detailText}>
              Next Irrigation in:{" "}
              {daysUntilNextIrrigation === 0
                ? "Irrigate today"
                : `${daysUntilNextIrrigation} days`}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome5 name="seedling" size={16} color="#2D6A4F" />
            <Text style={styles.detailText}>
              Growth: {100 - Math.round((daysRemaining / harvestDuration) * 100)}%
            </Text>
          </View>
        </View>

        {/* Other Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Details</Text>
          <View style={styles.detailRow}>
            <FontAwesome5 name="calendar-alt" size={16} color="#2D6A4F" />
            <Text style={styles.detailText}>Planted Date: {plantedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome5 name="calendar-check" size={16} color="#2D6A4F" />
            <Text style={styles.detailText}>
              Estimated Harvest Date: {estimatedHarvestDate}
            </Text>
          </View>
          {matchingCrop && (
            <>
              <View style={styles.detailRow}>
                <FontAwesome5 name="tint" size={16} color="#2D6A4F" />
                <Text style={styles.detailText}>
                  Irrigation Frequency: {matchingCrop.irrigationFrequency} days
                </Text>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome5 name="water" size={16} color="#2D6A4F" />
                <Text style={styles.detailText}>
                  Water Needs: {matchingCrop.waterNeeds}
                </Text>
              </View>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "#2D6A4F",
  },
  cropName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 10,
  },
});
