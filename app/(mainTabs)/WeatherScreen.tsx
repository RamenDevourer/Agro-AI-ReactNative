import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export default function WeatherScreen() {
  const [location, setLocation] = useState(null); // Start with null
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });

  const API_KEY = '42fa351f03a91fa500798a4225f411bc';

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        // Get stored location from AsyncStorage
        const storedLocation = await AsyncStorage.getItem('userLocation');
        if (storedLocation) {
          setLocation(JSON.parse(storedLocation));

          // Get coordinates for the stored location
          const locationData = await Location.geocodeAsync(storedLocation);
          if (locationData && locationData.length > 0) {
            const { latitude, longitude } = locationData[0];
            setCoordinates({ lat: latitude, lon: longitude });
            // Fetch weather data using the coordinates
            await fetchWeather(latitude, longitude);
          } else {
            console.error('Could not get coordinates for the stored location');
          }
        } else {
          console.warn('No location stored');
        }
      } catch (error) {
        console.error('Error fetching location and weather:', error);
      }
    };

    fetchLocationAndWeather();
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        ),
      ]);

      // Update current weather
      setCurrentWeather({
        temp: Math.round(currentRes.data.main.temp),
        condition: currentRes.data.weather[0].description,
        icon: currentRes.data.weather[0].icon,
        wind: currentRes.data.wind.speed,
        humidity: currentRes.data.main.humidity,
        cloudiness: currentRes.data.clouds.all,
      });

      // Update weekly forecast
      const dailyData = forecastRes.data.list.filter(
        (item, index) => index % 8 === 0
      );
      setWeeklyForecast(
        dailyData.map((item) => ({
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
          }),
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          condition: item.weather[0].description,
        }))
      );
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  // Helper function to map weather condition to icon name
  const getWeatherIconName = (iconCode) => {
    switch (iconCode) {
      case '01d':
        return 'sun'; // Clear sky (day)
      case '01n':
        return 'moon'; // Clear sky (night)
      case '02d':
      case '03d':
        return 'cloud-sun'; // Few clouds, scattered clouds (day)
      case '02n':
      case '03n':
        return 'cloud-moon'; // Few clouds, scattered clouds (night)
      case '04d':
      case '04n':
        return 'cloud'; // Broken clouds
      case '09d':
      case '09n':
        return 'cloud-showers-heavy'; // Shower rain
      case '10d':
        return 'cloud-sun-rain'; // Rain (day)
      case '10n':
        return 'cloud-moon-rain'; // Rain (night)
      case '11d':
      case '11n':
        return 'bolt'; // Thunderstorm
      case '13d':
      case '13n':
        return 'snowflake'; // Snow
      case '50d':
      case '50n':
        return 'smog'; // Mist
      default:
        return 'question'; // Unknown
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Location */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Weather Forecast</Text>
            <View style={styles.locationContainer}>
              <FontAwesome5
                name="map-marker-alt"
                size={16}
                color="#2D6A4F"
              />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <FontAwesome5 name="cog" size={20} color="#2D6A4F" />
          </TouchableOpacity>
        </View>

        {/* Current Weather */}
        {currentWeather && (
          <View style={styles.currentWeather}>
            <View style={styles.temperatureContainer}>
              <FontAwesome5
                name={getWeatherIconName(currentWeather.icon)}
                size={48}
                color="#FDB813"
              />
              <Text style={styles.temperature}>
                {currentWeather.temp}°C
              </Text>
              <Text style={styles.weatherCondition}>
                {currentWeather.condition}
              </Text>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <FontAwesome5 name="wind" size={16} color="#4B5563" />
                <Text style={styles.detailText}>
                  {currentWeather.wind} km/h
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <FontAwesome5 name="tint" size={16} color="#4B5563" />
                <Text style={styles.detailText}>
                  {currentWeather.humidity}%
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <FontAwesome5 name="cloud" size={16} color="#4B5563" />
                <Text style={styles.detailText}>
                  {currentWeather.cloudiness}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Weekly Forecast */}
        <View style={styles.forecastContainer}>
          <Text style={styles.sectionTitle}>5-Day Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weeklyForecast.map((day, index) => (
              <View key={index} style={styles.forecastDay}>
                <Text style={styles.dayText}>{day.day}</Text>
                <FontAwesome5
                  name={getWeatherIconName(day.icon)}
                  size={24}
                  color="#4B5563"
                  style={styles.forecastIcon}
                />
                <Text style={styles.forecastTemp}>{day.temp}°C</Text>
                <Text style={styles.forecastCondition}>{day.condition}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Weather Alerts */}
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Weather Alerts</Text>
          {weatherAlerts.length > 0 ? (
            weatherAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <Text>{alert.message}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noAlerts}>
              No weather alerts at the moment.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... (Rest of the styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 8,
  },
  settingsButton: {
    padding: 8,
  },
  currentWeather: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
  },
  temperatureContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  weatherCondition: {
    fontSize: 18,
    color: '#4B5563',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherDetail: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  forecastContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  forecastDay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    elevation: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  forecastIcon: {
    marginVertical: 8,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  forecastCondition: {
    fontSize: 14,
    color: '#4B5563',
  },
  alertsContainer: {
    marginBottom: 24,
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  highAlert: {
    backgroundColor: '#FEE2E2',
  },
  moderateAlert: {
    backgroundColor: '#FEF3C7',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1F2937',
  },
  alertMessage: {
    fontSize: 14,
    color: '#4B5563',
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  notificationText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
});