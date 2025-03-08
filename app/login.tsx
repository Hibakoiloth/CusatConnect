import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Initialize the Supabase client
const supabaseUrl = 'https://ygnogiyptesupksihfyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnbm9naXlwdGVzdXBrc2loZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzIyNzksImV4cCI6MjA1NjcwODI3OX0._044tK7NCQaoC7g27V3pd2k1e9MdW0esBNtZHjmLzB8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Store user session
      await AsyncStorage.setItem('user-session', JSON.stringify(data.session));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      console.log('Login successful', data);
      
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error.message);
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    router.push('/signup' as any); // Navigate to signup screen
    // Alternatively, you could implement signup functionality right here
  };

  const handlePasswordReset = () => {
    router.push('/reset-password' as any); // Navigate to password reset screen
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Text style={styles.title}>CUSAT Connect</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={handlePasswordReset}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.link}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
    paddingVertical: 5,
  },
});