import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar, SafeAreaView, Linking } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../utils/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);

      // Get the app's deep link URL
      const redirectUrl = await Linking.getInitialURL();
      const baseUrl = redirectUrl ? redirectUrl.split('//')[0] + '//' : 'cusatconnect://';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}reset-success`,
      });

      if (error) throw error;

      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for password reset instructions. Click the link in the email to reset your password.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      console.error('Reset password error:', error.message);
      Alert.alert('Reset Password Failed', error.message);
    } finally {
      setLoading(false);
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
          <Ionicons name="key" size={24} color="#E8D3B9" />
        </View>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-open" size={60} color="#E8D3B9" />
        </View>
        
        <Text style={styles.title}>Reset Password</Text>
        
        <Text style={styles.description}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>
        
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
        
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#E8D3B9" />
          ) : (
            <Text style={styles.resetButtonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
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
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  description: {
    fontSize: 16,
    color: '#8B7D6B',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1E14',
    borderRadius: 10,
    marginBottom: 25,
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
  resetButton: {
    backgroundColor: '#4F392D',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
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
