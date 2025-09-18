import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{title: 'Home'}}/>
      <Tabs.Screen name="explore" options={{title: 'Dashboard'}}/>
      <Tabs.Screen name="live-tracking" options={{title: 'Location'}}/>
      <Tabs.Screen name="trip-planner" options={{title: 'Trip Planner'}}/>
      <Tabs.Screen name="home" options={{title: 'Profile'}}/>
    </Tabs>
  );
}