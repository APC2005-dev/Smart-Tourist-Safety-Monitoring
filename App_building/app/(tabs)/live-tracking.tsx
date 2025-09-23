import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

interface PlannedSpot {
  name: string;
  coordinate: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  visited: boolean;
}

export default function LiveTrackingScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [plannedSpots, setPlannedSpots] = useState<PlannedSpot[]>([]);
  const [newSpotName, setNewSpotName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<any>(null);

  // Mock spots with coordinates + radius
  const mockSpots = {
    "Park": { latitude: 28.6139, longitude: 77.2090, radius: 200 }, // Delhi India Gate
    "Museum": { latitude: 28.6129, longitude: 77.2295, radius: 150 }, // National Museum
    "Mall": { latitude: 28.5355, longitude: 77.3910, radius: 300 }, // Noida
    "Airport": { latitude: 28.5562, longitude: 77.1000, radius: 500 }, // IGI Airport
  };

  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get initial location
      let current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy || undefined,
        speed: current.coords.speed || undefined,
        heading: current.coords.heading || undefined,
      });
    } catch (error) {
      setErrorMsg('Failed to get current location');
    }
  };

  const startTracking = async () => {
    if (!location) {
      Alert.alert('Location Error', 'Unable to get current location');
      return;
    }

    setIsTracking(true);
    const subscription = await Location.watchPositionAsync(
      { 
        accuracy: Location.Accuracy.High, 
        distanceInterval: 5,
        timeInterval: 3000,
      },
      (loc) => {
        const newLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy || undefined,
          speed: loc.coords.speed || undefined,
          heading: loc.coords.heading || undefined,
        };
        setLocation(newLocation);
        checkGeofences(newLocation);
      }
    );
    setLocationSubscription(subscription);
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  };

  const checkGeofences = (coords: LocationData) => {
    plannedSpots.forEach((spot, index) => {
      const spotData = mockSpots[spot.name as keyof typeof mockSpots];
      if (!spotData || spot.visited) return;

      const distance = getDistanceFromLatLonInM(
        coords.latitude,
        coords.longitude,
        spotData.latitude,
        spotData.longitude
      );

      if (distance <= spotData.radius) {
        setPlannedSpots(prev => 
          prev.map((s, i) => 
            i === index ? { ...s, visited: true } : s
          )
        );
        Alert.alert(
          "Destination Reached!", 
          `Welcome to ${spot.name}! Enjoy your visit.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    });
  };

  const getDistanceFromLatLonInM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const addSpot = () => {
    if (newSpotName && mockSpots[newSpotName as keyof typeof mockSpots]) {
      const spotData = mockSpots[newSpotName as keyof typeof mockSpots];
      setPlannedSpots(prev => [...prev, { 
        name: newSpotName, 
        coordinate: spotData, 
        visited: false 
      }]);
      setNewSpotName('');
    } else {
      Alert.alert(
        "Invalid Spot", 
        `Please enter a valid spot name. Available: ${Object.keys(mockSpots).join(', ')}`
      );
    }
  };

  const removeSpot = (index: number) => {
    setPlannedSpots(prev => prev.filter((_, i) => i !== index));
  };

  if (!location && !errorMsg) {
    return (
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        <View style={styles.loadingContent}>
          <Ionicons name="location-outline" size={48} color="#00d4ff" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (errorMsg) {
    return (
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        <View style={styles.errorContent}>
          <Ionicons name="location-off-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Location Access Required</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <View style={styles.container}>
        {/* Map */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location!.latitude,
            longitude: location!.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          followsUserLocation={isTracking}
        >
          {plannedSpots.map((spot, idx) => {
            const spotData = mockSpots[spot.name as keyof typeof mockSpots];
            return (
              <React.Fragment key={idx}>
                <Marker 
                  coordinate={spotData} 
                  title={spot.name}
                  description={spot.visited ? 'Visited' : 'Not visited'}
                >
                  <View style={[
                    styles.customMarker,
                    { backgroundColor: spot.visited ? '#4ade80' : '#00d4ff' }
                  ]}>
                    <Ionicons 
                      name={spot.visited ? 'checkmark' : 'location'} 
                      size={16} 
                      color="#ffffff" 
                    />
                  </View>
                </Marker>
                <Circle
                  center={spotData}
                  radius={spotData.radius}
                  strokeColor={spot.visited ? 'rgba(76, 222, 128, 0.5)' : 'rgba(0, 212, 255, 0.5)'}
                  fillColor={spot.visited ? 'rgba(76, 222, 128, 0.2)' : 'rgba(0, 212, 255, 0.2)'}
                  strokeWidth={2}
                />
              </React.Fragment>
            );
          })}
        </MapView>

        {/* Control Panel */}
        <View style={styles.controlPanel}>
          <LinearGradient
            colors={['rgba(15, 15, 35, 0.95)', 'rgba(26, 26, 46, 0.95)']}
            style={styles.panelGradient}
          >
            {/* Location Info */}
            <View style={styles.locationInfo}>
              <View style={styles.locationRow}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={16} color="#00d4ff" />
                </View>
                <View style={styles.locationDetails}>
                  <Text style={styles.coordsText}>
                    {location!.latitude.toFixed(5)}, {location!.longitude.toFixed(5)}
                  </Text>
                  <View style={styles.locationMeta}>
                    {location!.accuracy && (
                      <Text style={styles.metaText}>
                        ±{Math.round(location!.accuracy)}m
                      </Text>
                    )}
                    {location!.speed && (
                      <Text style={styles.metaText}>
                        {Math.round(location!.speed * 3.6)} km/h
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Tracking Controls */}
            <View style={styles.trackingControls}>
              <TouchableOpacity
                style={[
                  styles.trackingButton,
                  isTracking ? styles.stopButton : styles.startButton
                ]}
                onPress={isTracking ? stopTracking : startTracking}
              >
                <Ionicons 
                  name={isTracking ? 'stop' : 'play'} 
                  size={16} 
                  color="#ffffff" 
                />
                <Text style={styles.trackingButtonText}>
                  {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Add Destination */}
            <View style={styles.addDestination}>
              <Text style={styles.sectionTitle}>Add Destination</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Enter spot (Park, Museum, Mall, Airport)"
                    value={newSpotName}
                    onChangeText={setNewSpotName}
                    style={styles.spotInput}
                    placeholderTextColor="#6b7280"
                  />
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addSpot}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Planned Spots */}
            {plannedSpots.length > 0 && (
              <View style={styles.spotsSection}>
                <Text style={styles.sectionTitle}>Destinations</Text>
                {plannedSpots.map((spot, idx) => (
                  <View key={idx} style={styles.spotItem}>
                    <View style={[
                      styles.spotIndicator,
                      { backgroundColor: spot.visited ? '#4ade80' : '#00d4ff' }
                    ]}>
                      <Ionicons 
                        name={spot.visited ? 'checkmark' : 'location-outline'} 
                        size={12} 
                        color="#ffffff" 
                      />
                    </View>
                    <Text style={[
                      styles.spotName,
                      spot.visited && styles.visitedSpot
                    ]}>
                      {spot.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeSpot(idx)}
                    >
                      <Ionicons name="close" size={16} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0f23',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.6,
  },
  panelGradient: {
    padding: 20,
    paddingTop: 16,
  },
  locationInfo: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  coordsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  locationMeta: {
    flexDirection: 'row',
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 16,
  },
  trackingControls: {
    marginBottom: 20,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  startButton: {
    backgroundColor: '#4ade80',
  },
  stopButton: {
    backgroundColor: '#ff6b6b',
  },
  trackingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  addDestination: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  spotInput: {
    fontSize: 14,
    color: '#ffffff',
    paddingVertical: 14,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotsSection: {
    marginTop: 4,
  },
  spotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  spotIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  spotName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  visitedSpot: {
    color: '#4ade80',
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  removeButton: {
    padding: 4,
  },
});