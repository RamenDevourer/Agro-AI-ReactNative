import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { router } from "expo-router";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore"; // Import doc here

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  

  // Crop data for initializing AsyncStorage
  const cropData = [
    // ... (Your crop data remains the same)
    {
      name: "Tomato",
      season: "Kharif/Rabi",
      harvestDuration: 70,
      waterNeeds: "Medium",
      irrigationFrequency: 5,
    },
    {
      name: "Rice",
      season: "Kharif",
      harvestDuration: 120,
      waterNeeds: "High",
      irrigationFrequency: 7,
    },
    {
      name: "Wheat",
      season: "Rabi",
      harvestDuration: 100,
      waterNeeds: "Low",
      irrigationFrequency: 14,
    },
    {
      name: "Cotton",
      season: "Kharif",
      harvestDuration: 150,
      waterNeeds: "Medium",
      irrigationFrequency: 10,
    },
  ];

  const initializeAppData = async () => {
    try {
      const storedCropData = await AsyncStorage.getItem("cropData");
      if (storedCropData === null) {
        await AsyncStorage.setItem("cropData", JSON.stringify(cropData));
      }
    } catch (error) {
      console.error("Error initializing app data:", error);
    }
  };

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (token) {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          unsubscribe(); // Unsubscribe after the first check

          if (user) {
            // Fetch user data from Firestore and store it in AsyncStorage
            try {
                const userDocRef = doc(db, "users", user.uid); // doc is available now
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  await AsyncStorage.setItem("userData", JSON.stringify(userData));
                }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
            router.replace("/(mainTabs)/HomeScreen");
          } else {
            await AsyncStorage.removeItem("authToken");
            await AsyncStorage.removeItem("userData");
            router.replace("/(Auth)/LandingPage");
          }
        });
      } else {
        router.replace("/(Auth)/LandingPage");
      }
    } catch (error) {
      console.error("Error checking authentication state:", error);
      router.replace("/(Auth)/LandingPage");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAppData();
    checkAuthState();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return <View style={{ flex: 1 }} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default App;