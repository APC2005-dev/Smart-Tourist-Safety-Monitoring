import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Wait until auth is loaded
  useEffect(() => {
    if (authLoaded) {
      if (!isSignedIn) router.replace('/sign-in');
      else setReady(true);
    }
  }, [authLoaded, isSignedIn]);

  if (!ready || !userLoaded) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome, {user?.firstName ?? 'User'}!</Text>
      <Text>Email: {user?.emailAddresses?.[0]?.emailAddress ?? 'N/A'}</Text>
    </View>
  );
}