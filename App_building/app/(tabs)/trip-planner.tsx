import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

interface TripData {
  startLocation: string;
  destination: string;
  date: Date;
  returnDate: Date;
  travelers: number;
  tripType: 'business' | 'leisure' | 'emergency';
  notes: string;
}

export default function TripPlannerScreen() {
  const [tripData, setTripData] = useState<TripData>({
    startLocation: '',
    destination: '',
    date: new Date(),
    returnDate: new Date(Date.now() + 86400000), // Tomorrow
    travelers: 1,
    tripType: 'leisure',
    notes: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);

  // Hardcoded coordinates for demonstration
  const [startCoords] = useState({
    latitude: 28.6139, // Delhi
    longitude: 77.2090,
  });
  const [destCoords] = useState({
    latitude: 28.5355, // Noida
    longitude: 77.3910,
  });

  const tripTypes = [
    { value: 'leisure', label: 'Leisure', icon: 'happy-outline', color: '#4ade80' },
    { value: 'business', label: 'Business', icon: 'briefcase-outline', color: '#00d4ff' },
    { value: 'emergency', label: 'Emergency', icon: 'warning-outline', color: '#ff6b6b' },
  ];

  const handleInputChange = (field: keyof TripData, value: any) => {
    setTripData(prev => ({ ...prev, [field]: value }));
  };

  const validateTrip = () => {
    if (!tripData.startLocation.trim()) {
      Alert.alert('Missing Information', 'Please enter your starting location');
      return false;
    }
    if (!tripData.destination.trim()) {
      Alert.alert('Missing Information', 'Please enter your destination');
      return false;
    }
    if (tripData.date >= tripData.returnDate) {
      Alert.alert('Invalid Dates', 'Return date must be after departure date');
      return false;
    }
    return true;
  };

  const handleSaveTrip = async () => {
    if (!validateTrip()) return;

    setIsPlanning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Trip Planned Successfully!',
        `Your ${tripData.tripType} trip from ${tripData.startLocation} to ${tripData.destination} has been saved.`,
        [{ text: 'OK', onPress: () => console.log('Trip saved') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save trip. Please try again.');
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Plan Your Trip</Text>
              <Text style={styles.headerSubtitle}>
                Create a safe and organized travel plan
              </Text>
            </View>

            {/* Trip Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip Type</Text>
              <View style={styles.tripTypeContainer}>
                {tripTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.tripTypeCard,
                      tripData.tripType === type.value && styles.selectedTripType
                    ]}
                    onPress={() => handleInputChange('tripType', type.value)}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={24} 
                      color={tripData.tripType === type.value ? type.color : '#6b7280'} 
                    />
                    <Text style={[
                      styles.tripTypeText,
                      tripData.tripType === type.value && styles.selectedTripTypeText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location Inputs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Route Details</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#4ade80" style={styles.inputIcon} />
                <TextInput
                  placeholder="Starting location"
                  value={tripData.startLocation}
                  onChangeText={(value) => handleInputChange('startLocation', value)}
                  style={styles.input}
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.routeConnector}>
                <View style={styles.connectorLine} />
                <View style={styles.connectorDot} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="flag-outline" size={20} color="#ff6b6b" style={styles.inputIcon} />
                <TextInput
                  placeholder="Destination"
                  value={tripData.destination}
                  onChangeText={(value) => handleInputChange('destination', value)}
                  style={styles.input}
                  placeholderTextColor="#6b7280"
                />
              </View>
            </View>

            {/* Date & Travelers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip Details</Text>
              
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.inputContainer, styles.halfWidth]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                  <View style={styles.dateContent}>
                    <Text style={styles.dateLabel}>Departure</Text>
                    <Text style={styles.dateText}>
                      {tripData.date.toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.inputContainer, styles.halfWidth]}
                  onPress={() => setShowReturnDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
                  <View style={styles.dateContent}>
                    <Text style={styles.dateLabel}>Return</Text>
                    <Text style={styles.dateText}>
                      {tripData.returnDate.toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color="#8b5cf6" style={styles.inputIcon} />
                <View style={styles.travelerContainer}>
                  <Text style={styles.travelerLabel}>Number of travelers</Text>
                  <View style={styles.travelerControls}>
                    <TouchableOpacity
                      style={styles.travelerButton}
                      onPress={() => handleInputChange('travelers', Math.max(1, tripData.travelers - 1))}
                    >
                      <Ionicons name="remove" size={16} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.travelerCount}>{tripData.travelers}</Text>
                    <TouchableOpacity
                      style={styles.travelerButton}
                      onPress={() => handleInputChange('travelers', tripData.travelers + 1)}
                    >
                      <Ionicons name="add" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Map Preview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Route Preview</Text>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: (startCoords.latitude + destCoords.latitude) / 2,
                    longitude: (startCoords.longitude + destCoords.longitude) / 2,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5,
                  }}
                >
                  <Marker 
                    coordinate={startCoords} 
                    title="Start"
                    pinColor="#4ade80"
                  />
                  <Marker 
                    coordinate={destCoords} 
                    title="Destination"
                    pinColor="#ff6b6b"
                  />
                  <Polyline
                    coordinates={[startCoords, destCoords]}
                    strokeColor="#00d4ff"
                    strokeWidth={3}
                  />
                </MapView>
                <View style={styles.mapOverlay}>
                  <View style={styles.distanceCard}>
                    <Ionicons name="car-outline" size={16} color="#00d4ff" />
                    <Text style={styles.distanceText}>~45 km • 1h 30m</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="document-text-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="Add any special notes or requirements..."
                  value={tripData.notes}
                  onChangeText={(value) => handleInputChange('notes', value)}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#6b7280"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.planButton, isPlanning && styles.disabledButton]}
                onPress={handleSaveTrip}
                disabled={isPlanning}
              >
                <LinearGradient
                  colors={['#00d4ff', '#0ea5e9']}
                  style={styles.planGradient}
                >
                  {isPlanning ? (
                    <Ionicons name="sync-outline" size={20} color="#ffffff" />
                  ) : (
                    <Ionicons name="checkmark" size={20} color="#ffffff" />
                  )}
                  <Text style={styles.planButtonText}>
                    {isPlanning ? 'Planning Trip...' : 'Save Trip Plan'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={20} color="#00d4ff" />
                <Text style={styles.shareButtonText}>Share Trip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Date Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={tripData.date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) handleInputChange('date', selectedDate);
            }}
          />
        )}

        {showReturnDatePicker && (
          <DateTimePicker
            value={tripData.returnDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowReturnDatePicker(false);
              if (selectedDate) handleInputChange('returnDate', selectedDate);
            }}
          />
        )}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripTypeCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedTripType: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  tripTypeText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    fontWeight: '500',
  },
  selectedTripTypeText: {
    color: '#00d4ff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  routeConnector: {
    alignItems: 'center',
    marginVertical: -6,
    zIndex: 1,
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#6b7280',
  },
  connectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4ff',
    position: 'absolute',
    top: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: (width - 52) / 2,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  travelerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  travelerLabel: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  travelerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  mapContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    height: 200,
    borderRadius: 16,
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  distanceCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 16,
  },
  planButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  planGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  shareButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00d4ff',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});