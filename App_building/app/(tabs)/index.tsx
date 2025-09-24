// app/(tabs)/index.tsx - Updated to send alerts to external website backend

import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
  Platform
} from 'react-native';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

// ⭐ CONFIGURE YOUR WEBSITE'S BACKEND URL HERE ⭐
const WEBSITE_BACKEND_URL = 'http://localhost:4000/api'; // Replace with actual website backend URL
// For testing: 'http://localhost:4000/api' (if website backend runs on port 4000)

export default function HomeScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Get address from coordinates
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address[0] ? 
            `${address[0].street || ''} ${address[0].city || ''} ${address[0].region || ''}`.trim() 
            : 'Address unavailable',
          accuracy: location.coords.accuracy
        };
      } catch (addressError) {
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: 'Address unavailable',
          accuracy: location.coords.accuracy
        };
      }

    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  };

  const sendEmergencyToWebsite = async (emergencyType = 'other', customMessage = 'Emergency assistance needed') => {
    setEmergencyLoading(true);
    
    try {
      // Vibrate phone for emergency feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate([0, 250, 250, 250]);
      } else {
        Vibration.vibrate([250, 250, 250, 250]);
      }

      // Get current location (optional)
      const location = await getCurrentLocation();

      // Prepare alert data for website backend
      const alertData = {
        // Basic alert info
        userId: user?.id || 'anonymous',
        alertType: 'emergency',
        emergencyType,
        message: customMessage,
        priority: 'high',
        
        // User information
        userInfo: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous',
          email: user?.emailAddresses?.[0]?.emailAddress || 'N/A',
          phone: user?.phoneNumbers?.[0]?.phoneNumber || 'N/A',
          userId: user?.id
        },
        
        // Location data
        location: location || { 
          latitude: null, 
          longitude: null, 
          address: 'Location unavailable',
          accuracy: null 
        },
        
        // Metadata
        timestamp: new Date().toISOString(),
        source: 'mobile_app',
        appVersion: '1.0.0',
        platform: Platform.OS,
        
        // Device info (optional)
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version
        }
      };

      console.log('Sending emergency alert to website:', alertData);

      // Send to website backend with timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let response;
      try {
        response = await fetch(`${WEBSITE_BACKEND_URL}/emergency/alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Add any authentication headers if required by website backend
            // 'Authorization': 'Bearer your-app-token',
            // 'X-API-Key': 'your-api-key',
          },
          body: JSON.stringify(alertData),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // Handle non-JSON responses
        result = { 
          success: response.ok, 
          message: response.ok ? 'Alert sent successfully' : 'Failed to send alert',
          status: response.status 
        };
      }

      if (response.ok && result.success !== false) {
        // Success
        Alert.alert(
          '🚨 Emergency Alert Sent!',
          `Your ${emergencyType} emergency alert has been sent to our monitoring team successfully!\n\n${result.alertId ? `Alert ID: ${result.alertId}` : 'Alert ID: Pending'}\n\nOur team has been notified and will respond accordingly.`,
          [{ text: 'OK' }]
        );
        
        console.log('Emergency alert sent successfully:', result);
      } else {
        // Server returned error
        throw new Error(result.error || result.message || `Server error: ${response.status}`);
      }

    } catch (error) {
      console.error('Emergency alert error:', error);
      
      let errorMessage = 'Unable to send emergency alert. Please try again.';
      
      // Provide specific error messages
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        'message' in error &&
        typeof (error as any).name === 'string' &&
        typeof (error as any).message === 'string'
      ) {
        if ((error as any).name === 'TypeError' && (error as any).message.includes('Network request failed')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if ((error as any).message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if ((error as any).message.includes('404')) {
          errorMessage = 'Emergency service temporarily unavailable. Please try again later.';
        } else if ((error as any).message.includes('500')) {
          errorMessage = 'Server error. Our team has been notified. Please try again.';
        }
      }
      
      Alert.alert(
        'Emergency Alert Failed',
        errorMessage,
        [
          { text: 'Retry', onPress: () => sendEmergencyToWebsite(emergencyType, customMessage) },
          { 
            text: 'Call Emergency', 
            onPress: () => Alert.alert('Emergency Numbers', 'Call 911 for immediate emergency assistance'),
            style: 'destructive'
          },
          { text: 'Cancel' }
        ]
      );
    } finally {
      setEmergencyLoading(false);
    }
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      "🚨 Emergency Alert",
      "What type of emergency are you experiencing?\n\nThis will send an alert to our emergency monitoring team.",
      [
        {
          text: "🏥 Medical Emergency",
          onPress: () => confirmEmergencyAlert('medical', 'Medical emergency - immediate medical assistance needed'),
          style: "destructive"
        },
        {
          text: "🚗 Car Accident",
          onPress: () => confirmEmergencyAlert('accident', 'Car accident - emergency services needed at location'),
          style: "destructive"
        },
        {
          text: "🔧 Vehicle Breakdown",
          onPress: () => confirmEmergencyAlert('breakdown', 'Vehicle breakdown - roadside assistance needed')
        },
        {
          text: "🛡️ Security Issue",
          onPress: () => confirmEmergencyAlert('security', 'Security emergency - immediate help needed'),
          style: "destructive"
        },
        {
          text: "⚠️ Other Emergency",
          onPress: () => confirmEmergencyAlert('other', 'Emergency situation - assistance needed'),
          style: "destructive"
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const confirmEmergencyAlert = (type: string, message: string) => {
    Alert.alert(
      "Confirm Emergency Alert",
      `Are you sure you want to send a ${type.toUpperCase()} emergency alert?\n\n✅ Our monitoring team will be notified immediately\n📍 Your location will be shared (if available)\n📞 Emergency contacts may be notified\n\nThis action will trigger our emergency response protocol.`,
      [
        {
          text: "🚨 Send Emergency Alert",
          onPress: () => sendEmergencyToWebsite(type, message),
          style: "destructive"
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const quickActions = [
    {
      icon: 'location-outline',
      title: 'Live Tracking',
      subtitle: 'Track your current location',
      color: '#00d4ff',
      route: '/live-tracking'
    },
    {
      icon: 'map-outline',
      title: 'Trip Planner',
      subtitle: 'Plan your next adventure',
      color: '#4ade80',
      route: '/trip-planner'
    },
    {
      icon: 'notifications-outline',
      title: 'Safety Alerts',
      subtitle: 'View safety notifications',
      color: '#f59e0b',
      route: '/alert'
    },
    {
      icon: 'person-outline',
      title: 'Profile',
      subtitle: 'Manage your account',
      color: '#8b5cf6',
      route: '/home'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      icon: 'shield-checkmark-outline',
      title: 'Safety check completed',
      time: '2 hours ago',
      color: '#4ade80'
    },
    {
      id: 2,
      icon: 'location-outline',
      title: 'Location updated',
      time: '3 hours ago',
      color: '#00d4ff'
    },
    {
      id: 3,
      icon: 'alert-circle-outline',
      title: 'Weather alert received',
      time: '5 hours ago',
      color: '#f59e0b'
    }
  ];

  if (!isLoaded) {
    return (
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner}>
            <Ionicons name="sync-outline" size={32} color="#00d4ff" />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.firstName || 'Traveler'} 👋</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/alert')}
            >
              <Ionicons name="notifications-outline" size={24} color="#ffffff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Time & Weather Card */}
          <View style={styles.timeCard}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.dateText}>
                {currentTime.toLocaleDateString([], { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <View style={styles.weatherInfo}>
              <Ionicons name="partly-sunny-outline" size={32} color="#f59e0b" />
              <Text style={styles.weatherText}>22°C</Text>
            </View>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIndicator}>
                <Ionicons name="shield-checkmark" size={24} color="#4ade80" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>You're Safe</Text>
                <Text style={styles.statusSubtitle}>Emergency services connected</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.statusButton}>
              <Text style={styles.statusButtonText}>View Details</Text>
              <Ionicons name="chevron-forward" size={16} color="#00d4ff" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>View all</Text>
              </TouchableOpacity>
            </View>

            {recentActivities.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
                  <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Enhanced Emergency Button */}
          <TouchableOpacity 
            style={[styles.emergencyButton, emergencyLoading && styles.emergencyButtonDisabled]}
            onPress={handleEmergencyPress}
            disabled={emergencyLoading}
          >
            <LinearGradient
              colors={emergencyLoading ? ['#666', '#444'] : ['#ff4757', '#ff3742']}
              style={styles.emergencyGradient}
            >
              <Ionicons 
                name={emergencyLoading ? "sync" : "warning"} 
                size={28} 
                color="#ffffff"
                style={emergencyLoading ? styles.spinning : {}}
              />
              <Text style={styles.emergencyText}>
                {emergencyLoading ? 'Sending Alert...' : '🚨 EMERGENCY ALERT'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Connection Status Indicator */}
          <View style={styles.connectionStatus}>
            <Ionicons name="shield-checkmark" size={16} color="#4ade80" />
            <Text style={styles.connectionText}>Emergency services connected</Text>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
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
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
  },
  timeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  weatherInfo: {
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: 'rgba(76, 222, 128, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(76, 222, 128, 0.3)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d4ff',
    marginRight: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  seeAll: {
    fontSize: 14,
    color: '#00d4ff',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  activityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emergencyButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 12,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  emergencyButtonDisabled: {
    opacity: 0.7,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
  },
  connectionText: {
    fontSize: 12,
    color: '#4ade80',
    marginLeft: 6,
  },
  spinning: {
    // Add rotation animation if needed
  },
  bottomSpacing: {
    height: 40,
  }
});