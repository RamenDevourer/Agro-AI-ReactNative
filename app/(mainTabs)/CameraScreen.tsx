import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as ImagePicker from 'expo-image-picker';

const Tab = createMaterialTopTabNavigator();

const API_URL = 'http://10.0.2.2:8000/disease/predict/';

function PlantAnalysis() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [predictedDisease, setPredictedDisease] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelection = async (source) => {
    console.log(`Image selection triggered from: ${source}`);
    setPredictedDisease(null);
    setConfidence(null);
    setIsLoading(true);

    let result = null;
    const options = {
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    };

    try {
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          console.error('Camera permissions not granted');
          alert('Sorry, we need camera permissions to make this work!');
          setIsLoading(false);
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          console.error('Media library permissions not granted');
          alert('Sorry, we need media library permissions to make this work!');
          setIsLoading(false);
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (result && !result.canceled) {
        console.log('Image selected successfully');
        setSelectedImage({ uri: result.assets[0].uri });
        uploadImage(result.assets[0].uri);
      } else {
        console.log('Image selection cancelled');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error during image selection:', error);
      setIsLoading(false);
    }
  };

  const uploadImage = async (imageUri) => {
    console.log('Uploading image...');
    setIsLoading(true);

    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename ?? '');
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Prediction from server:', responseData);
        setPredictedDisease(responseData.predicted_disease);
        setConfidence(responseData.confidence);
      } else {
        console.error('Error from server:', responseData);
        alert(`Error: ${responseData.error || 'Failed to get prediction'}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plant Analysis</Text>
        <Text style={styles.headerSubtitle}>
          Capture or upload plant images for health analysis
        </Text>
      </View>

      {/* Image Preview Area */}
      <View style={styles.previewContainer}>
        {selectedImage ? (
          <Image source={selectedImage} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <FontAwesome5 name="leaf" size={40} color="#2D6A4F" />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      {/* Display prediction results */}
      {predictedDisease && confidence !== null && !isLoading && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Prediction Results</Text>
          <Text style={styles.resultText}>
            Predicted Disease: {predictedDisease}
          </Text>
          <Text style={styles.resultText}>
            Confidence: {(confidence * 100).toFixed(2)}%
          </Text>
        </View>
      )}

      {/* Show loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
          <Text style={styles.loadingText}>Analyzing...</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleImageSelection('camera')}
          disabled={isLoading}
        >
          <FontAwesome5 name="camera" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.uploadButton]}
          onPress={() => handleImageSelection('gallery')}
          disabled={isLoading}
        >
          <FontAwesome5 name="images" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Upload Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Tips for better analysis:</Text>
        <View style={styles.instructionItem}>
          <FontAwesome5 name="sun" size={16} color="#2D6A4F" />
          <Text style={styles.instructionText}>Ensure good lighting</Text>
        </View>
        <View style={styles.instructionItem}>
          <FontAwesome5 name="crop-alt" size={16} color="#2D6A4F" />
          <Text style={styles.instructionText}>Focus on affected areas</Text>
        </View>
        <View style={styles.instructionItem}>
          <FontAwesome5 name="expand" size={16} color="#2D6A4F" />
          <Text style={styles.instructionText}>Keep the plant in frame</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function PestIdentification() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pest Identification</Text>
        <Text style={styles.headerSubtitle}>Capture or upload images for pest identification</Text>
      </View>

      {/* Image Preview Area */}
      <View style={styles.previewContainer}>
        {selectedImage ? (
          <Image source={selectedImage} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <FontAwesome5 name="bug" size={40} color="#A40606" />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => alert('Opening camera...')}>
          <FontAwesome5 name="camera" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.uploadButton]}
          onPress={() => alert('Opening gallery...')}
        >
          <FontAwesome5 name="images" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Upload Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Tips for better analysis:</Text>
        <View style={styles.instructionItem}>
          <FontAwesome5 name="sun" size={16} color="#2D6A4F" />
          <Text style={styles.instructionText}>Ensure good lighting</Text>
        </View>
        <View style={styles.instructionItem}>
          <FontAwesome5 name="crop-alt" size={16} color="#2D6A4F" />
          <Text style={styles.instructionText}>Focus on pests</Text>
        </View>
        <View style={styles.instructionItem}>
          <FontAwesome5 name="expand" size={16} color="#2D6A4F" />
          <Text style={styles.instructionText}>Keep the image in focus</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function CameraScreen() {
  return (
    <View style={styles.container}>
      {/* Heading */}
      <Text style={styles.heading}>Camera Features</Text>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen name="Plant Analysis" component={PlantAnalysis} />
        <Tab.Screen name="Pest Identification" component={PestIdentification} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  pageHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
    marginVertical: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  previewContainer: {
    height: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2D6A4F',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  uploadButton: {
    marginRight: 0,
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#4B5563',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10, // Space around the heading
    color: '#000000', // Black text color
  },
  tabBar: {
    backgroundColor: '#F5F5F5', // Light gray for tabs
  },
  tabIndicator: {
    backgroundColor: '#000000', // Black indicator
  },
  tabLabel: {
    fontWeight: 'bold',
    color: '#000000', // Black text color for tab labels
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
  },
});