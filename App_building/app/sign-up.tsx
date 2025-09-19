// app/sign-up.tsx
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export default function SignUpScreen() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!isLoaded) return;
    try {
      // Step 1: Create a new sign-up
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Step 2: Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Switch UI to verification step
      setPendingVerification(true);
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || err.message);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    try {
      // Step 3: Attempt email verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        // Step 4: Activate the session
        await setActive({ session: completeSignUp.createdSessionId });

        // Redirect to home after successful sign-up
        router.replace('/');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {!pendingVerification ? (
        <>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              padding: 8,
              marginBottom: 12,
              borderRadius: 6,
            }}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              borderWidth: 1,
              padding: 8,
              marginBottom: 12,
              borderRadius: 6,
            }}
          />
          <Button title="Sign Up" onPress={handleSignUp} />
          <Button
            title="Already have an account? Sign In"
            onPress={() => router.push('/sign-in')}
          />
        </>
      ) : (
        <>
          <Text>Enter the verification code sent to your email:</Text>
          <TextInput
            placeholder="Verification Code"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              padding: 8,
              marginBottom: 12,
              borderRadius: 6,
              marginTop: 12,
            }}
          />
          <Button title="Verify Email" onPress={handleVerify} />
        </>
      )}
      {error ? (
        <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>
      ) : null}
    </View>
  );
}