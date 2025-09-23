import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

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
                <Text style={styles.statusSubtitle}>All systems monitoring</Text>
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

          {/* Emergency Button */}
          <TouchableOpacity style={styles.emergencyButton}>
            <LinearGradient
              colors={['#ff6b6b', '#ee5a52']}
              style={styles.emergencyGradient}
            >
              <Ionicons name="warning" size={24} color="#ffffff" />
              <Text style={styles.emergencyText}>Emergency Alert</Text>
            </LinearGradient>
          </TouchableOpacity>

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
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  }
});