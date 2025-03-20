import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, SafeAreaView, ImageBackground, Animated, Dimensions, Easing } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
  const [fontsLoaded] = useFonts({
    'Roboto-Medium': require('../assets/fonts/Roboto/static/Roboto-Medium.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto/static/Roboto-Regular.ttf'),
    'Oswald-Bold': require('../assets/fonts/Oswald/static/Oswald-Bold.ttf'),
    'Oswald-SemiBold': require('../assets/fonts/Oswald/static/Oswald-SemiBold.ttf'),
  });
  
  // Animation for pulsing glow
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for background movement
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  
  // Setup pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Setup perfectly seamless back-and-forth diagonal movement
    Animated.loop(
      Animated.sequence([
        // Move diagonally upward to the left (point A to point B)
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 6000, // 6 seconds for upward-left movement (faster)
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad), // Smooth acceleration and deceleration
        }),
        // Move diagonally downward to the right (point B back to point A)
        Animated.timing(backgroundAnim, {
          toValue: 0,
          duration: 6000, // 6 seconds for downward-right movement (faster)
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad), // Smooth acceleration and deceleration
        }),
      ])
    ).start();
  }, []);
  
  const navigateToLogin = (userType: string) => {
    // Navigate directly to login page without animation
    router.push({
      pathname: '/login',
      params: { userType }
    });
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Animation values with slightly increased movement range
  const backgroundTranslateX = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70] // Increase horizontal movement
  });
  
  const backgroundTranslateY = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -45] // Increase vertical movement
  });
  
  return (
    <Animated.View style={styles.backgroundContainer}>
      <Animated.Image 
        source={require('../assets/images/connection.jpeg')} 
        style={[
          styles.backgroundImage,
          {
            transform: [
              { translateX: backgroundTranslateX },
              { translateY: backgroundTranslateY }
            ]
          }
        ]}
      />
      
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        
        <LinearGradient
          colors={['rgba(0, 0, 0, 1)','rgba(0, 0, 0, 1)','rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerWithStatusBar}
        >
          <SafeAreaView style={styles.safeAreaContent}>
            <View>
              <Image source={require('../assets/images/cclogo.png')} style={styles.logo} />
            </View>
            <Text style={styles.title}>CUSATCONNECT</Text>
          </SafeAreaView>
        </LinearGradient>
        
        <View style={styles.content}>
          
            <View style={styles.blackContainer}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.buttonWrapper} 
                  onPress={() => navigateToLogin('Student')}
                >
                  <LinearGradient
                  colors={['rgb(255, 255, 255)', 'rgb(255, 255, 255)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.loginButton}
                  >
                    <Ionicons name="school" size={24} color="rgb(0, 0, 0)" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Student Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.buttonWrapper} 
                  onPress={() => navigateToLogin('Teacher')}
                >
                  <LinearGradient
                  colors={['rgb(255, 255, 255)', 'rgb(255, 255, 255)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.loginButton}
                  >
                    <FontAwesome5 name="chalkboard-teacher" size={24} color="rgb(0, 0, 0)" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Teacher Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.buttonWrapper} 
                  onPress={() => navigateToLogin('Office')}
                >
                  <LinearGradient
                  colors={['rgb(255, 255, 255)', 'rgb(255, 255, 255)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.loginButton}
                  >
                    <MaterialIcons name="business" size={24} color="rgb(0, 0, 0)" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Office Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© Cochin University of Science and Technology</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    overflow: 'hidden', // Ensures the moving background stays within bounds
  },
  backgroundImage: {
    position: 'absolute',
    width: '150%', // Increase width further to allow for movement
    height: '150%', // Increase height further to allow for movement
    top: -80, // Position further off-screen
    left: -80, // Position further off-screen
  },
  container: {
    flex: 1,
  },
  headerWithStatusBar: {
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  safeAreaContent: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    marginTop: 20,
    borderRadius: 40,
  },
  fallbackLogo: {
    opacity: 0.9,
  },
  title: {
    fontSize: 28,
    fontWeight: 'normal',
    color: 'rgb(255, 255, 255)',
    textAlign: 'center',
    fontStyle: 'normal',
    fontFamily: 'Oswald-Bold',
    marginBottom: 15,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    paddingTop: 60,
  },

  blackContainer: {
    marginTop:50,
    backgroundColor: 'rgb(0, 0, 0)',
    borderRadius: 30,
    padding: 30,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 5,
  },
  buttonWrapper: {
    width: '100%',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: 'rgb(0, 0, 0)',
  },
  buttonIcon: {
    marginRight: 15, 
  },
  buttonText: {
    color: 'rgb(0, 0, 0)',
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'Roboto-Medium',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'rgb(0, 0, 0)',
  },
  footerText: {
    color: 'rgb(255, 255, 255)',
    fontFamily: 'Oswald-SemiBold',
    fontSize: 14,
  },
});

