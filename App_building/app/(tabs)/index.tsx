import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')} // ✅ Change this to your app logo later
          style={styles.reactLogo}
        />
      }
    >
      {/* ✅ Greeting Section */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          Welcome, {user?.firstName || 'Guest'} 👋
        </ThemedText>
      </ThemedView>

      {/* ✅ Quick Actions */}
      <ThemedView style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/live-tracking')}
        >
          <ThemedText type="subtitle">📍 Live Tracking</ThemedText>
          <ThemedText>Check real-time location data</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/home')}
        >
          <ThemedText type="subtitle">👤 Profile</ThemedText>
          <ThemedText>View and edit your profile</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/home')}
        >
          <ThemedText type="subtitle">⚙️ Settings</ThemedText>
          <ThemedText>App preferences & more</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  cardContainer: {
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});