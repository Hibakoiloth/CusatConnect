import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert, Image, ActivityIndicator, SafeAreaView } from "react-native";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabaseClient';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function LoginScreen() {
  const { userType = 'Student' } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      await AsyncStorage.setItem('userType', userType as string);
      
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
    router.push({
      pathname: '/signup',
      params: { userType }
    });
  };

  const handlePasswordReset = () => {
    router.push('/reset-password' as any);
  };

  const getIcon = () => {
    switch(userType) {
      case 'Student':
        return <Ionicons name="school" size={20} color="#E8D3B9" />;
      case 'Teacher':
        return <FontAwesome5 name="chalkboard-teacher" size={20} color="#E8D3B9" />;
      case 'Office':
        return <MaterialIcons name="business" size={20} color="#E8D3B9" />;
      default:
        return <Ionicons name="person" size={20} color="#E8D3B9" />;
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
          {getIcon()}
        </View>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>{userType} Login</Text>
        
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
        
        <TouchableOpacity 
          style={styles.forgotPassword} 
          onPress={handlePasswordReset}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#E8D3B9" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
    fontWeight: "bold",
    color: "#E8D3B9",
    marginBottom: 30,
    textAlign: "center",
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#E8D3B9",
    fontSize: 14,
    fontStyle: 'italic',
  },
  loginButton: {
    backgroundColor: "#2D1E14",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#E8D3B9",
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: 'italic',
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#8B7D6B",
    fontSize: 14,
  },
  signupLink: {
    color: "#E8D3B9",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: 'italic',
  },
});