import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function SignUpScreen() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    
    setLoading(true);
    setError('');
    
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    
    setLoading(true);
    setError('');
    
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        // Redirect to profile form for new users
        router.replace('/profile-form');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {pendingVerification ? 'Verify Email' : 'Sign Up'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              {!pendingVerification && (
                <View style={styles.logoContainer}>
                  <View style={styles.logo}>
                    <Ionicons name="person-add" size={32} color="#00d4ff" />
                  </View>
                </View>
              )}
              <Text style={styles.title}>
                {pendingVerification ? 'Check Your Email' : 'Create Account'}
              </Text>
              <Text style={styles.subtitle}>
                {pendingVerification 
                  ? 'Enter the verification code we sent you' 
                  : 'Join us and get started today'
                }
              </Text>
            </View>

            <View style={styles.form}>
            {!pendingVerification ? (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={styles.input}
                    placeholderTextColor="#6b7280"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    style={[styles.input, styles.passwordInput]}
                    placeholderTextColor="#6b7280"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#00d4ff" 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>Password requirements:</Text>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={password.length >= 8 ? "#4ade80" : "#6b7280"} 
                    />
                    <Text style={[styles.requirementText, password.length >= 8 && styles.requirementMet]}>
                      At least 8 characters
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.signUpButton, loading && styles.disabledButton]}
                  onPress={handleSignUp}
                  disabled={loading || !email || !password}
                >
                  <Text style={styles.signUpButtonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signInLink}
                  onPress={() => router.push('/sign-in')}
                >
                  <Text style={styles.signInText}>
                    Already have an account? <Text style={styles.signInTextBold}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.verificationContainer}>
                  <View style={styles.emailSentIcon}>
                    <Ionicons name="mail" size={48} color="#00d4ff" />
                  </View>
                  <Text style={styles.verificationText}>
                    We've sent a 6-digit verification code to
                  </Text>
                  <Text style={styles.emailText}>{email}</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="key-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.input}
                    placeholderTextColor="#6b7280"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.verifyButton, loading && styles.disabledButton]}
                  onPress={handleVerify}
                  disabled={loading || code.length < 6}
                >
                  <Text style={styles.verifyButtonText}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendLink}
                  onPress={() => {
                    signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });
                  }}
                >
                  <Text style={styles.resendText}>
                    Didn't receive the code? <Text style={styles.resendTextBold}>Resend</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    opacity: 0.9,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  passwordRequirements: {
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#4ade80',
  },
  signUpButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00d4ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  verifyButton: {
    backgroundColor: '#4ade80',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4ade80',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    color: '#0f0f23',
    fontSize: 16,
    fontWeight: '700',
  },
  verifyButtonText: {
    color: '#0f0f23',
    fontSize: 16,
    fontWeight: '700',
  },
  signInLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  signInText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  signInTextBold: {
    fontWeight: '600',
    color: '#00d4ff',
  },
  verificationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emailSentIcon: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  verificationText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#00d4ff',
    fontWeight: '600',
    textAlign: 'center',
  },
  resendLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  resendTextBold: {
    fontWeight: '600',
    color: '#00d4ff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});