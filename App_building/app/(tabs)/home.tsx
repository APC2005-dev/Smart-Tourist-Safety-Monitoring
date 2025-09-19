// import { useAuth, useUser } from '@clerk/clerk-expo';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { Text, View } from 'react-native';

// export default function HomeScreen() {
//   const { isSignedIn, isLoaded: authLoaded } = useAuth();
//   const { user, isLoaded: userLoaded } = useUser();
//   const router = useRouter();
//   const [ready, setReady] = useState(false);

//   // Wait until auth is loaded
//   useEffect(() => {
//     if (authLoaded) {
//       if (!isSignedIn) router.replace('/sign-in');
//       else setReady(true);
//     }
//   }, [authLoaded, isSignedIn]);

//   if (!ready || !userLoaded) return <Text>Loading...</Text>;

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Welcome, {user?.firstName ?? 'User'}!</Text>
//       <Text>Email: {user?.emailAddresses?.[0]?.emailAddress ?? 'N/A'}</Text>
//     </View>
//   );
// }

import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";

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

  if (!ready || !userLoaded) return <Text>Loading...</Text>;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {/* Profile Info */}
      <View style={{ marginBottom: 20, alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          {user?.firstName ?? "User"} {user?.lastName ?? ""}
        </Text>
        <Text style={{ fontSize: 16, color: "gray" }}>
          {user?.emailAddresses?.[0]?.emailAddress ?? "N/A"}
        </Text>
        <Text style={{ fontSize: 12, color: "gray", marginTop: 5 }}>
          User ID: {user?.id}
        </Text>
      </View>

      {/* Settings Section */}
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Settings
        </Text>
        <Button title="Update Profile" onPress={() => alert("Coming soon")} />
        <View style={{ height: 10 }} />
        <Button title="Change Password" onPress={() => alert("Coming soon")} />
        <View style={{ height: 10 }} />
        <Button title="Notification Preferences" onPress={() => alert("Coming soon")} />
      </View>

      {/* Trip History Section */}
      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Trip History
        </Text>
        <Text style={{ color: "gray" }}>
          (No trips yet. Your past trips will show here.)
        </Text>
      </View>

      {/* Logout */}
      <View style={{ marginVertical: 20 }}>
        <Button
          title="Logout"
          color="red"
          onPress={async () => {
            await signOut();
            router.replace("/sign-in");
          }}
        />
      </View>
    </ScrollView>
  );
}