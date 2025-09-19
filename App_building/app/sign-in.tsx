import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export default function SignInScreen() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!isLoaded) return;
    try {
      const response = await signIn.create({ identifier: email, password });
      await setActive({ session: response.createdSessionId });
      router.replace('/'); // redirect home
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 6 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 6 }}
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Button
        title="Don't have an account? Sign Up"
        onPress={() => router.push('/sign-up')}  // <-- this is the navigation
      />
      {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
    </View>
  );
}