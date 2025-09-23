import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import * as Location from "expo-location";
import axios from "axios";

const SEQ_LEN = 10;

// --------------------
// Type Definitions
// --------------------
type GPSPoint = {
  lat: number;
  lon: number;
  alt: number;
  timestamp: number; // Unix timestamp
};

type PredictionResponse = {
  prediction: string;
  code: number;
};

export default function SafetyMonitor() {
  const [points, setPoints] = useState<GPSPoint[]>([]);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const sessionStart = useRef<number>(Date.now() / 1000); // Unix timestamp

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Cannot access GPS without permission.");
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // every 5 sec
          distanceInterval: 5, // every 5 meters
        },
        (loc) => {
          const newPoint: GPSPoint = {
            lat: loc.coords.latitude,
            lon: loc.coords.longitude,
            alt: loc.coords.altitude ?? 0,
            timestamp: loc.timestamp / 1000,
          };

          setPoints((prev) => {
            const updated = [...prev, newPoint].slice(-SEQ_LEN);
            if (updated.length === SEQ_LEN) sendForPrediction(updated);
            return updated;
          });
        }
      );
    };

    requestLocationPermission();
  }, []);

  async function sendForPrediction(pointsData: GPSPoint[]) {
    try {
      const res = await axios.post<PredictionResponse>(
        "http://192.168.29.29:8000/predict",
        {
          session_start: sessionStart.current,
          points: pointsData,
        }
      );
      setPrediction(res.data);
    } catch (err) {
      console.error("Prediction API Error:", err);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tourist Safety Monitor</Text>

      <FlatList
        data={points}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.point}>
            {item.lat.toFixed(5)}, {item.lon.toFixed(5)}
          </Text>
        )}
      />

      {prediction && (
        <View style={styles.result}>
          <Text style={styles.prediction}>
            Prediction: {prediction.prediction}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  point: { fontSize: 14, color: "#555" },
  result: { marginTop: 20, padding: 10, backgroundColor: "#eee", borderRadius: 10 },
  prediction: { fontSize: 18, fontWeight: "600", color: "#333" },
});