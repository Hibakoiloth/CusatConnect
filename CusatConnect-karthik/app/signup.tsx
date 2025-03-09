import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabaseClient';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function SignupScreen() {
  const { userType = 'Student' } = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    try {
      // Validate inputs
      if (!email || !password || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }

      setLoading(true);

      // If signing up as a student, verify email exists in student table
      if (userType === 'Student') {
        const { data: studentData, error: studentError } = await supabase
          .from('student')
          .select('s_email')
          .eq('s_email', email.toLowerCase().trim())
          .maybeSingle();

        if (studentError) {
          console.error('Student verification error:', studentError);
          Alert.alert('Error', 'Failed to verify student email. Please try again.');
          setLoading(false);
          return;
        }

        if (!studentData) {
          Alert.alert(
            'Invalid Student Email',
            'This email is not registered in the student database. Please use your official student email or contact administration.'
          );
          setLoading(false);
          return;
        }
      }

      // Sign up with Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            userType: userType,
            name: email.split('@')[0],
          }
        }
      });

      if (error) throw error;

      Alert.alert(
        'Account Created',
        'Your account has been created successfully. Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
      
    } catch (error: any) {
      console.error('Signup error:', error.message);
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push({
      pathname: '/login',
      params: { userType }
    });
  };

  const getIcon = () => {
    switch(userType) {
      case 'Student':
        return <Ionicons name="school" size={40} color="#E8D3B9" />;
      case 'Teacher':
        return <FontAwesome5 name="chalkboard-teacher" size={40} color="#E8D3B9" />;
      case 'Office':
        return <MaterialIcons name="business" size={40} color="#E8D3B9" />;
      default:
        return <Ionicons name="person" size={40} color="#E8D3B9" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D1E14" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E8D3B9" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <MaterialIcons name="school" size={24} color="#E8D3B9" />
        </View>
      </View>
      
      <View style={styles.formContainer}>

        
        <Text style={styles.title}>{userType} Registration</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#E8D3B9" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8B7D6B"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#E8D3B9" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8B7D6B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#E8D3B9" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#E8D3B9" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#8B7D6B"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#E8D3B9" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.signupButton} 
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#E8D3B9" />
          ) : (
            <Text style={styles.signupButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: "#2D1E14",
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#2D1E14',
    borderRadius: 20,
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E8D3B9',
    marginBottom: 30,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1E14',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4F392D',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#E8D3B9',
  },
  eyeIcon: {
    padding: 10,
  },
  signupButton: {
    backgroundColor: '#2D1E14',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#E8D3B9',
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#8B7D6B',
    fontSize: 14,
  },
  loginLink: {
    color: '#E8D3B9',
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});
