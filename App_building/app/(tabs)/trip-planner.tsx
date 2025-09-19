import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Button, Platform, StyleSheet, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function TripPlannerScreen() {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Hardcoded coordinates for now (you can later replace with geocoding)
  const [startCoords, setStartCoords] = useState({
    latitude: 28.6139, // Delhi
    longitude: 77.2090,
  });
  const [destCoords, setDestCoords] = useState({
    latitude: 28.5355, // Noida
    longitude: 77.3910,
  });

  const handleSaveTrip = () => {
    console.log('Trip Saved:', { startLocation, destination, date });
    alert(`Trip planned!\n${startLocation} → ${destination}\n${date.toLocaleString()}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Plan Your Trip</ThemedText>

      {/* Start Location Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Start Location"
        value={startLocation}
        onChangeText={(text) => {
          setStartLocation(text);
          // For now we just toggle hardcoded coords - later use geocoding API
          setStartCoords({ latitude: 28.6139, longitude: 77.2090 });
        }}
      />

      {/* Destination Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Destination"
        value={destination}
        onChangeText={(text) => {
          setDestination(text);
          setDestCoords({ latitude: 28.5355, longitude: 77.3910 });
        }}
      />

      {/* Date & Time Picker */}
      <Button title="Select Date & Time" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <ThemedText style={styles.datePreview}>
        Trip Date: {date.toLocaleString()}
      </ThemedText>

      {/* Map Preview */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: startCoords.latitude,
          longitude: startCoords.longitude,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        <Marker coordinate={startCoords} title="Start" />
        <Marker coordinate={destCoords} title="Destination" />
      </MapView>

      {/* Save Button */}
      <Button title="Save Trip" onPress={handleSaveTrip} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  datePreview: {
    marginTop: 8,
    fontSize: 16,
  },
  map: {
    height: 250,
    borderRadius: 12,
    marginVertical: 12,
  },
});
