// // import { useAuth, useUser } from '@clerk/clerk-expo';
// // import { useRouter } from 'expo-router';
// // import React, { useEffect, useState } from 'react';
// // import { Text, View } from 'react-native';

// // export default function HomeScreen() {
// //   const { isSignedIn, isLoaded: authLoaded } = useAuth();
// //   const { user, isLoaded: userLoaded } = useUser();
// //   const router = useRouter();
// //   const [ready, setReady] = useState(false);

// //   // Wait until auth is loaded
// //   useEffect(() => {
// //     if (authLoaded) {
// //       if (!isSignedIn) router.replace('/sign-in');
// //       else setReady(true);
// //     }
// //   }, [authLoaded, isSignedIn]);

// //   if (!ready || !userLoaded) return <Text>Loading...</Text>;

// //   return (
// //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// //       <Text>Welcome, {user?.firstName ?? 'User'}!</Text>
// //       <Text>Email: {user?.emailAddresses?.[0]?.emailAddress ?? 'N/A'}</Text>
// //     </View>
// //   );
// // }

// import { useAuth, useUser } from "@clerk/clerk-expo";
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { Button, ScrollView, Text, View } from "react-native";

// export default function ProfileScreen() {
//   const { isSignedIn, isLoaded: authLoaded, signOut } = useAuth();
//   const { user, isLoaded: userLoaded } = useUser();
//   const router = useRouter();
//   const [ready, setReady] = useState(false);

//   // Wait until auth is loaded
//   useEffect(() => {
//     if (authLoaded) {
//       if (!isSignedIn) router.replace("/sign-in");
//       else setReady(true);
//     }
//   }, [authLoaded, isSignedIn]);

//   if (!ready || !userLoaded) return <Text>Loading...</Text>;

//   return (
//     <ScrollView style={{ flex: 1, padding: 20 }}>
//       {/* Profile Info */}
//       <View style={{ marginBottom: 20, alignItems: "center" }}>
//         <Text style={{ fontSize: 24, fontWeight: "bold" }}>
//           {user?.firstName ?? "User"} {user?.lastName ?? ""}
//         </Text>
//         <Text style={{ fontSize: 16, color: "gray" }}>
//           {user?.emailAddresses?.[0]?.emailAddress ?? "N/A"}
//         </Text>
//         <Text style={{ fontSize: 12, color: "gray", marginTop: 5 }}>
//           User ID: {user?.id}
//         </Text>
//       </View>

//       {/* Settings Section */}
//       <View style={{ marginVertical: 20 }}>
//         <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
//           Settings
//         </Text>
//         <Button title="Update Profile" onPress={() => alert("Coming soon")} />
//         <View style={{ height: 10 }} />
//         <Button title="Change Password" onPress={() => alert("Coming soon")} />
//         <View style={{ height: 10 }} />
//         <Button title="Notification Preferences" onPress={() => alert("Coming soon")} />
//       </View>

//       {/* Trip History Section */}
//       <View style={{ marginVertical: 20 }}>
//         <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
//           Trip History
//         </Text>
//         <Text style={{ color: "gray" }}>
//           (No trips yet. Your past trips will show here.)
//         </Text>
//       </View>

//       {/* Logout */}
//       <View style={{ marginVertical: 20 }}>
//         <Button
//           title="Logout"
//           color="red"
//           onPress={async () => {
//             await signOut();
//             router.replace("/sign-in");
//           }}
//         />
//       </View>
//     </ScrollView>
//   );
// }

import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { isSignedIn, isLoaded: authLoaded, signOut } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Wait until auth is loaded
  useEffect(() => {
    if (authLoaded) {
      if (!isSignedIn) router.replace("/sign-in");
      else setReady(true);
    }
  }, [authLoaded, isSignedIn]);

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/sign-in");
          }
        }
      ]
    );
  };

  const settingsItems = [
    { 
      icon: "person-outline", 
      title: "Update Profile", 
      subtitle: "Edit your personal information",
      color: "#00d4ff"
    },
    { 
      icon: "lock-closed-outline", 
      title: "Change Password", 
      subtitle: "Update your security credentials",
      color: "#4ade80"
    },
    { 
      icon: "notifications-outline", 
      title: "Notifications", 
      subtitle: "Manage your notification preferences",
      color: "#f59e0b"
    },
    { 
      icon: "shield-checkmark-outline", 
      title: "Privacy & Security", 
      subtitle: "Control your privacy settings",
      color: "#8b5cf6"
    }
  ];

  if (!ready || !userLoaded) {
    return (
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner}>
            <Ionicons name="person-circle-outline" size={64} color="#00d4ff" />
          </View>
          <Text style={styles.loadingText}>Loading your profile...</Text>
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
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#00d4ff', '#0ea5e9']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {(user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U').toUpperCase()}
                </Text>
              </LinearGradient>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.firstName ?? "User"} {user?.lastName ?? ""}
              </Text>
              <Text style={styles.userEmail}>
                {user?.emailAddresses?.[0]?.emailAddress ?? "N/A"}
              </Text>
              <View style={styles.userIdContainer}>
                <Ionicons name="key-outline" size={12} color="#6b7280" />
                <Text style={styles.userId}>ID: {user?.id.slice(-8)}</Text>
              </View>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="car-outline" size={24} color="#00d4ff" />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time-outline" size={24} color="#4ade80" />
              </View>
              <Text style={styles.statNumber}>0h</Text>
              <Text style={styles.statLabel}>Travel Time</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="location-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Miles</Text>
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={20} color="#00d4ff" />
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>
            
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={() => Alert.alert("Coming Soon", `${item.title} feature will be available soon!`)}
              >
                <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Trip History Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color="#00d4ff" />
              <Text style={styles.sectionTitle}>Recent Trips</Text>
            </View>
            
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="car-outline" size={48} color="#6b7280" />
              </View>
              <Text style={styles.emptyTitle}>No trips yet</Text>
              <Text style={styles.emptySubtitle}>
                Your travel history will appear here once you start your first trip
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Bottom Spacing */}
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 8,
    borderWidth: 3,
    borderColor: '#0f0f23',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 8,
  },
  userIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userId: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  settingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});