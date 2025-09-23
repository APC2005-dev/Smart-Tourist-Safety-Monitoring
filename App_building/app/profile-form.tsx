import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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
import { Picker } from '@react-native-picker/picker';

export default function ProfileFormScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
    idNumber: '',
    idType: 'aadhar',
    diseases: '',
    emergencyContact: '',
    emergencyName: '',
  });
  const [loading, setLoading] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['name', 'age', 'gender', 'bloodGroup', 'idNumber', 'emergencyContact', 'emergencyName'];
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        Alert.alert('Missing Information', `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 120');
      return false;
    }

    if (formData.emergencyContact.length < 10) {
      Alert.alert('Invalid Contact', 'Please enter a valid emergency contact number');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Profile Created Successfully!',
        'Your profile has been saved. Welcome to the app!',
        [{ text: 'Continue', onPress: () => router.replace('/') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
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
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Ionicons name="person-add" size={32} color="#00d4ff" />
                </View>
              </View>
              <Text style={styles.title}>Tell us about yourself</Text>
              <Text style={styles.subtitle}>
                This information helps us provide better safety features
              </Text>
            </View>

            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                <TextInput
                  placeholder="Full Name"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  style={styles.input}
                  placeholderTextColor="#6b7280"
                />
              </View>

              {/* Age Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                <TextInput
                  placeholder="Age"
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#6b7280"
                />
              </View>

              {/* Gender Picker */}
              <View style={styles.pickerContainer}>
                <Ionicons name="transgender-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    style={styles.picker}
                    dropdownIconColor="#00d4ff"
                  >
                    <Picker.Item label="Select Gender" value="" />
                    {genders.map(gender => (
                      <Picker.Item key={gender} label={gender} value={gender} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Blood Group Picker */}
              <View style={styles.pickerContainer}>
                <Ionicons name="water-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.bloodGroup}
                    onValueChange={(value) => handleInputChange('bloodGroup', value)}
                    style={styles.picker}
                    dropdownIconColor="#00d4ff"
                  >
                    <Picker.Item label="Select Blood Group" value="" />
                    {bloodGroups.map(group => (
                      <Picker.Item key={group} label={group} value={group} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* ID Type Picker */}
              <View style={styles.pickerContainer}>
                <Ionicons name="card-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.idType}
                    onValueChange={(value) => handleInputChange('idType', value)}
                    style={styles.picker}
                    dropdownIconColor="#00d4ff"
                  >
                    <Picker.Item label="Aadhar Card" value="aadhar" />
                    <Picker.Item label="Passport" value="passport" />
                  </Picker>
                </View>
              </View>

              {/* ID Number Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                <TextInput
                  placeholder={formData.idType === 'aadhar' ? 'Aadhar Number' : 'Passport Number'}
                  value={formData.idNumber}
                  onChangeText={(value) => handleInputChange('idNumber', value)}
                  style={styles.input}
                  placeholderTextColor="#6b7280"
                />
              </View>

              {/* Diseases Input (Optional) */}
              <View style={styles.inputContainer}>
                <Ionicons name="medical-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                <TextInput
                  placeholder="Medical Conditions (Optional)"
                  value={formData.diseases}
                  onChangeText={(value) => handleInputChange('diseases', value)}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#6b7280"
                />
              </View>

              <View style={styles.sectionHeader}>
                <Ionicons name="call-outline" size={18} color="#00d4ff" />
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
              </View>

              {/* Emergency Contact Name */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                <TextInput
                  placeholder="Emergency Contact Name"
                  value={formData.emergencyName}
                  onChangeText={(value) => handleInputChange('emergencyName', value)}
                  style={styles.input}
                  placeholderTextColor="#6b7280"
                />
              </View>

              {/* Emergency Contact Number */}
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#00d4ff" style={styles.inputIcon} />
                <TextInput
                  placeholder="Emergency Contact Number"
                  value={formData.emergencyContact}
                  onChangeText={(value) => handleInputChange('emergencyContact', value)}
                  keyboardType="phone-pad"
                  style={styles.input}
                  placeholderTextColor="#6b7280"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Saving Profile...' : 'Complete Profile'}
                </Text>
              </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 28,
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 54,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00d4ff',
    marginLeft: 8,
  },
  submitButton: {
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
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#0f0f23',
    fontSize: 16,
    fontWeight: '700',
  },
});