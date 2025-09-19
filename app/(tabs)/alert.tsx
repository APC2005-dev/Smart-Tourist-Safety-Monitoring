import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useState } from 'react';
import { Alert, Button, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      title: 'Heavy Rainfall Warning',
      message: 'Rain expected in your current location. Stay indoors if possible.',
      type: 'weather',
      timestamp: new Date().toLocaleString(),
    },
    {
      id: '2',
      title: 'Restricted Zone Alert',
      message: 'You are near a restricted zone. Please avoid entry.',
      type: 'safety',
      timestamp: new Date().toLocaleString(),
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate fetching new alerts from your backend
    setTimeout(() => {
      setAlerts((prev) => [
        {
          id: Math.random().toString(),
          title: 'New Safety Update',
          message: 'Nearby landslide reported. Authorities are monitoring.',
          type: 'danger',
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);
      setRefreshing(false);
    }, 1500);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Are you sure you want to clear all alerts?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setAlerts([]) },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Alerts & Notifications
      </ThemedText>

      <Button title="Clear All Alerts" onPress={handleClearAll} />

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <ThemedText type="subtitle">{item.title}</ThemedText>
            <ThemedText>{item.message}</ThemedText>
            <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
          </View>
        )}
        ListEmptyComponent={<ThemedText>No alerts at the moment 🎉</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    marginBottom: 8,
  },
  alertCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
});