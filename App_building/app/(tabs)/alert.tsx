import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'weather' | 'safety' | 'danger' | 'info';
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      title: 'Heavy Rainfall Warning',
      message: 'Rain expected in your current location. Stay indoors if possible and avoid flooded roads.',
      type: 'weather',
      timestamp: new Date().toLocaleString(),
      priority: 'high',
      read: false,
    },
    {
      id: '2',
      title: 'Restricted Zone Alert',
      message: 'You are approaching a restricted zone. Please avoid entry for your safety.',
      type: 'safety',
      timestamp: new Date(Date.now() - 3600000).toLocaleString(),
      priority: 'medium',
      read: true,
    },
    {
      id: '3',
      title: 'Travel Advisory',
      message: 'Construction work ahead on your planned route. Consider alternate paths.',
      type: 'info',
      timestamp: new Date(Date.now() - 7200000).toLocaleString(),
      priority: 'low',
      read: false,
    },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'weather': return 'cloud-outline';
      case 'safety': return 'shield-outline';
      case 'danger': return 'warning-outline';
      case 'info': return 'information-circle-outline';
      default: return 'notifications-outline';
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    if (priority === 'high') return '#ff6b6b';
    if (type === 'weather') return '#00d4ff';
    if (type === 'safety') return '#f59e0b';
    if (type === 'danger') return '#ff6b6b';
    return '#8b5cf6';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert-circle-outline';
      case 'low': return 'information-circle-outline';
      default: return 'information-circle-outline';
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setAlerts((prev) => [
        {
          id: Math.random().toString(),
          title: 'New Safety Update',
          message: 'Nearby landslide reported on mountain roads. Authorities are monitoring the situation closely.',
          type: 'danger',
          timestamp: new Date().toLocaleString(),
          priority: 'high',
          read: false,
        },
        ...prev,
      ]);
      setRefreshing(false);
    }, 1500);
  };

  const handleMarkAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Alerts', 
      'Are you sure you want to clear all alerts? This action cannot be undone.', 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: () => setAlerts([]) 
        },
      ]
    );
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const renderAlert = ({ item }: { item: AlertItem }) => {
    const alertColor = getAlertColor(item.type, item.priority);
    
    return (
      <TouchableOpacity
        style={[
          styles.alertCard,
          !item.read && styles.unreadAlert
        ]}
        onPress={() => handleMarkAsRead(item.id)}
      >
        <View style={styles.alertHeader}>
          <View style={[styles.alertIcon, { backgroundColor: `${alertColor}20` }]}>
            <Ionicons 
              name={getAlertIcon(item.type) as any} 
              size={24} 
              color={alertColor} 
            />
          </View>
          <View style={styles.alertContent}>
            <View style={styles.alertTitleRow}>
              <Text style={styles.alertTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {item.priority === 'high' && (
                <View style={styles.priorityBadge}>
                  <Ionicons name="alert-circle" size={12} color="#ff6b6b" />
                </View>
              )}
              {!item.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.alertMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.alertTimestamp}>
              {item.timestamp}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Safety Alerts</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="notifications" size={20} color="#00d4ff" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{alerts.length}</Text>
              <Text style={styles.statLabel}>Total Alerts</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="alert-circle" size={20} color="#f59e0b" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{unreadCount}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{alerts.length - unreadCount}</Text>
              <Text style={styles.statLabel}>Read</Text>
            </View>
          </View>
        </View>

        {/* Alerts List */}
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlert}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor="#00d4ff"
              colors={['#00d4ff']}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={64} color="#6b7280" />
              </View>
              <Text style={styles.emptyTitle}>No alerts</Text>
              <Text style={styles.emptySubtitle}>
                You're all caught up! New safety alerts will appear here.
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Ionicons name="refresh-outline" size={20} color="#00d4ff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 12,
  },
  unreadBadge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  listContainer: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unreadAlert: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  alertHeader: {
    flexDirection: 'row',
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  priorityBadge: {
    marginLeft: 8,
    marginRight: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4ff',
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 8,
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d4ff',
    marginLeft: 8,
  },
});