import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Text, TextInput, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

export default function LiveTracking() {
  const [location, setLocation] = useState<any>(null);
  const [plannedSpots, setPlannedSpots] = useState<any[]>([]);
  const [newSpotName, setNewSpotName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hardcoded mock spots with coordinates + radius
  const mockSpots = {
    "Park": { latitude: 28.6139, longitude: 77.2090, radius: 200 }, // Delhi India Gate
    "Museum": { latitude: 28.6129, longitude: 77.2295, radius: 150 } // National Museum
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get initial location
      let current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);

      // Watch for updates
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (loc) => {
          setLocation(loc.coords);
          checkGeofences(loc.coords);
        }
      );
    })();
  }, []);

  const checkGeofences = (coords: any) => {
    plannedSpots.forEach((spot) => {
      const spotData = mockSpots[spot.name];
      if (!spotData) return;

      const distance = getDistanceFromLatLonInM(
        coords.latitude,
        coords.longitude,
        spotData.latitude,
        spotData.longitude
      );

      if (distance <= spotData.radius) {
        Alert.alert("Spot Reached!", `You are now inside ${spot.name}`);
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

    return R * c; // distance in meters
  };

  const addSpot = () => {
    if (newSpotName && mockSpots[newSpotName]) {
      setPlannedSpots([...plannedSpots, { name: newSpotName }]);
      setNewSpotName('');
    } else {
      Alert.alert("Invalid Spot", "Please enter a valid spot name (Park or Museum).");
    }
  };

  if (!location) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Fetching Location...</Text>
      {errorMsg ? <Text style={{ color: 'red' }}>{errorMsg}</Text> : null}
    </View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {/* Markers for planned spots */}
        {plannedSpots.map((spot, idx) => {
          const spotData = mockSpots[spot.name];
          return (
            <React.Fragment key={idx}>
              <Marker coordinate={spotData} title={spot.name} />
              <Circle
                center={spotData}
                radius={spotData.radius}
                strokeColor="rgba(255,0,0,0.5)"
                fillColor="rgba(255,0,0,0.2)"
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Input for new spot */}
      <View style={{ position: 'absolute', top: 20, left: 10, right: 10, backgroundColor: 'white', padding: 10, borderRadius: 8 }}>
        <Text>Current Location: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
        <TextInput
          placeholder="Enter Spot (Park / Museum)"
          value={newSpotName}
          onChangeText={setNewSpotName}
          style={{ borderWidth: 1, borderRadius: 5, marginVertical: 5, padding: 5 }}
        />
        <Button title="Add Spot" onPress={addSpot} />
        <FlatList
          data={plannedSpots}
          renderItem={({ item }) => <Text>✅ {item.name}</Text>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
}