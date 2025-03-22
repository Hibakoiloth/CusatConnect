import { StyleSheet, Image, ScrollView, TouchableOpacity, View, StatusBar, SafeAreaView, Animated, Easing, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export default function ProfileScreen() {
  const [teacherData, setTeacherData] = useState(null);
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchStudentData();
    setupBackgroundAnimation();
  }, []);

  const setupBackgroundAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(backgroundAnim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    ).start();
  };

  const fetchStudentData = async () => {
    try {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user');
        return;
      }

      // Get user's email
      const userEmail = user.email;

      // Query the teacher table using the email
      const { data, error } = await supabase
        .from('teacher')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error) throw error;
      setTeacherData(data);
      console.log('Fetched teacher data:', data);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all stored data
      await AsyncStorage.removeItem('user-session');
      await AsyncStorage.removeItem('isAuthenticated');
      await AsyncStorage.removeItem('userType');
      
      // Navigate to the role selection screen
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const backgroundTranslateX = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70]
  });
  
  const backgroundTranslateY = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -45]
  });

  return (
    <Animated.View style={styles.backgroundContainer}>
      <Animated.Image 
        source={require('../../assets/images/connection.jpeg')} 
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
          colors={['rgba(0, 0, 0, 0.7)','rgba(0, 0, 0, 0.5)','rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerWithStatusBar}
        >
          <SafeAreaView style={styles.safeAreaContent}>
            <Text style={styles.title}>Profile</Text>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.blackContainer}>
            <View style={styles.profileContainer}>
              <ThemedText style={styles.nameText}>{teacherData?.name || 'Teacher Name'}</ThemedText>

              <View style={styles.infoRow}>
                <Ionicons name="business" size={20} color="white" />
                <ThemedText style={styles.infoText}>Department: {teacherData?.dept}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color="white" />
                <ThemedText style={styles.infoText}>Email: {teacherData?.email}</ThemedText>
              </View>

              
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
              >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="log-out" size={24} color="rgb(0, 0, 0)" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                  </View>
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
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    top: -80,
    left: -80,
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
  title: {
    fontSize: 28,
    color: 'rgb(255, 255, 255)',
    fontFamily: 'Oswald-Bold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  blackContainer: {
    backgroundColor: 'rgb(0, 0, 0)',
    borderRadius: 30,
    padding: 30,
    width: '100%',
  },
  profileContainer: {
    width: '100%',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(255, 255, 255)',
  },
  logoutButtonText: {
    color: "rgb(0, 0, 0)",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
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
