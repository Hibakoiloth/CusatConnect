import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function IndexScreen() {
  const navigateToLogin = (userType: string) => {
    router.push({
      pathname: '/login',
      params: { userType }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D1E14" />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="school" size={60} color="#E8D3B9" style={styles.fallbackLogo} />
        </View>
        <Text style={styles.title}>CUSAT Connect</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Let's Get Started</Text>

        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigateToLogin('Student')}
          >
            <Ionicons name="school" size={24} color="#E8D3B9" />
            <Text style={styles.buttonText}>Student Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigateToLogin('Teacher')}
          >
            <FontAwesome5 name="chalkboard-teacher" size={24} color="#E8D3B9" />
            <Text style={styles.buttonText}>Teacher Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigateToLogin('Office')}
          >
            <MaterialIcons name="business" size={24} color="#E8D3B9" />
            <Text style={styles.buttonText}>Office Login</Text>
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
    backgroundColor: '#2D1E14',
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#2D1E14',
    borderRadius: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  fallbackLogo: {
    opacity: 0.9,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E8D3B9',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#E8D3B9',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E8D3B9',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  description: {
    fontSize: 16,
    color: '#E8D3B9',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 15,
  },
  loginButton: {
    backgroundColor: '#2D1E14',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#E8D3B9',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    fontStyle: 'italic',
  },
  footer: {
    padding: 15,
    backgroundColor: '#2D1E14',
    alignItems: 'center',
  },
  footerText: {
    color: '#E8D3B9',
    fontSize: 12,
  },
});
