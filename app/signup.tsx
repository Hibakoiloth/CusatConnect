import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar, SafeAreaView, Animated, Dimensions, Easing, Modal, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Custom Alert Component Types
interface AlertButton {
  text: string;
  onPress?: () => void;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
}

// Custom Alert Component
const CustomAlert = ({ visible, title, message, buttons, onClose }: CustomAlertProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={alertStyles.centeredView}>
        <View style={alertStyles.modalView}>
          <Text style={alertStyles.modalTitle}>{title}</Text>
          <Text style={alertStyles.modalText}>{message}</Text>
          <View style={alertStyles.buttonContainer}>
            {buttons.map((btn: AlertButton, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  alertStyles.button,
                  index === buttons.length - 1 && alertStyles.primaryButton
                ]}
                onPress={() => {
                  onClose();
                  btn.onPress && btn.onPress();
                }}
              >
                <Text style={[
                  alertStyles.buttonText,
                  index === buttons.length - 1 && alertStyles.primaryButtonText
                ]}>{btn.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function SignupScreen() {
  const { userType = 'Student' } = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Custom alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    title: '',
    message: '',
    buttons: [{ text: 'OK' }]
  });
  
  // Custom alert function
  const showCustomAlert = (title: string, message: string, buttons: AlertButton[] = [{ text: 'OK' }]) => {
    setAlertConfig({
      title,
      message,
      buttons
    });
    setAlertVisible(true);
  };
  
  // Animation for background movement
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  
  // Setup background animation on component mount
  useEffect(() => {
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
  
  // Animation values with increased movement range
  const backgroundTranslateX = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70] // Increase horizontal movement
  });
  
  const backgroundTranslateY = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -45] // Increase vertical movement
  });

  const handleSignup = async () => {
    try {
      // Validate inputs
      if (!email || !password || !confirmPassword) {
        showCustomAlert('Error', 'Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        showCustomAlert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        showCustomAlert('Error', 'Password must be at least 6 characters');
        return;
      }

      setLoading(true);

      // First, check if the email exists in the correct role table
      let tableName = userType === 'Student' ? 'student' : 
                      userType === 'Teacher' ? 'teacher' : 'office_staff';
      
      console.log(`Checking ${tableName} table for email: ${email}`);
      
      // Get the correct column name based on the table
      let emailColumn;
      if (tableName === 'student') {
        emailColumn = 's_email';
      } else if (tableName === 'teacher') {
        emailColumn = 't_email';  // Assuming teacher table uses t_email
      } else {
        emailColumn = 'o_email';  // Assuming office_staff table uses os_email
      }
      
      console.log(`Using column name: ${emailColumn}`);
      
      // Use ilike for case insensitive matching with the correct column name
      let { data: roleData, error: roleError } = await supabase
        .from(tableName)
        .select('*')
        .ilike(emailColumn, email.trim())
        
      console.log('Query result:', roleData, roleError);
        
      if (roleError) {
        console.error('Database error:', roleError);
        showCustomAlert(
          'Database Error', 
          'An error occurred while checking your registration. Please try again later.'
        );
        setLoading(false);
        return;
      }
      
      if (!roleData || roleData.length === 0) {
        console.log(`No ${userType} account found with email: ${email}`);
        showCustomAlert(
          'Registration Failed', 
          `No ${userType} account was found with this email address. Please check the email or contact your administrator.`
        );
        setLoading(false);
        return;
      }
      
      console.log(`${userType} account found:`, roleData[0]);

      // If email exists in the correct role table, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'cusatconnect://login',
          data: {
            userType: userType,
            name: email.split('@')[0],
          }
        }
      });

      if (error) throw error;

      console.log('Signup successful', data);
      
      if (data.session) {
        // User is automatically signed in
        await AsyncStorage.setItem('user-session', JSON.stringify(data.session));
        await AsyncStorage.setItem('isAuthenticated', 'true');
        await AsyncStorage.setItem('userType', userType as string);
        
        // Navigate to the main app
        router.replace('/(tabs)');
        
        showCustomAlert(
          'Account Created',
          'Your account has been created successfully. Please verify your email when you receive the verification link.'
        );
      } else {
        // Email confirmation required but we'll let user proceed anyway for testing
        showCustomAlert(
          'Account Created',
          'Your account has been created. For development purposes, you can proceed to login now.',
          [
            { 
              text: 'Login Now', 
              onPress: async () => {
                // For development, try to sign in immediately
                try {
                  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                  });
                  
                  if (signInError) throw signInError;
                  
                  if (signInData.session) {
                    await AsyncStorage.setItem('user-session', JSON.stringify(signInData.session));
                    await AsyncStorage.setItem('isAuthenticated', 'true');
                    await AsyncStorage.setItem('userType', userType as string);
                    router.replace('/(tabs)');
                  }
                } catch (signInErr: any) {
                  console.error('Auto-login error:', signInErr.message);
                  router.replace('/login');
                }
              } 
            },
            { text: 'Go to Login', onPress: () => router.replace('/login') }
          ]
        );
      }
    } catch (error: any) {
      console.error('Signup error:', error.message);
      showCustomAlert('Signup Failed', error.message);
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
        return <Ionicons name="school" size={24} color="rgb(0, 0, 0)" />;
      case 'Teacher':
        return <FontAwesome5 name="chalkboard-teacher" size={24} color="rgb(0, 0, 0)" />;
      case 'Office':
        return <MaterialIcons name="business" size={24} color="rgb(0, 0, 0)" />;
      default:
        return <Ionicons name="person" size={24} color="rgb(0, 0, 0)" />;
    }
  };

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
          colors={['rgba(0, 0, 0, 0.7)','rgba(0, 0, 0, 0.5)','rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerWithStatusBar}
        >
          <SafeAreaView style={styles.safeAreaContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="rgb(255, 255, 255)" />
            </TouchableOpacity>
            <Text style={styles.title}>{userType} Registration</Text>
          </SafeAreaView>
        </LinearGradient>
        
        <View style={styles.content}>
          <View style={styles.blackContainer}>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="rgb(0, 0, 0)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(0, 0, 0, 0.6)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="rgb(0, 0, 0)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(0, 0, 0, 0.6)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="rgb(0, 0, 0)" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="rgb(0, 0, 0)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="rgba(0, 0, 0, 0.6)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="rgb(0, 0, 0)" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.buttonWrapper} 
                onPress={handleSignup}
                disabled={loading}
              >
                <LinearGradient
                  colors={['rgb(255, 255, 255)', 'rgb(255, 255, 255)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.signupButton}
                >
                  {loading ? (
                    <ActivityIndicator color="rgb(0, 0, 0)" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {getIcon()}
                      <Text style={styles.signupButtonText}>Create Account</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© Cochin University of Science and Technology</Text>
        </View>
      </View>
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </Animated.View>
  );
}

// Alert styles
const alertStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'rgb(0, 0, 0)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'rgb(255, 255, 255)',
    fontFamily: 'Oswald-Bold',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    color: 'rgb(255, 255, 255)',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  buttonContainer: {
    flexDirection: Platform.OS === 'ios' ? 'row' : 'column',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 12,
    elevation: 2,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
    margin: 5,
    minWidth: Platform.OS === 'ios' ? 100 : '80%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: 'rgb(255, 255, 255)',
    borderColor: 'rgb(0, 0, 0)',
  },
  buttonText: {
    color: 'rgb(255, 255, 255)',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
  },
  primaryButtonText: {
    color: 'rgb(0, 0, 0)',
  },
});

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'normal',
    color: 'rgb(255, 255, 255)',
    fontFamily: 'Oswald-Bold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackContainer: {
    backgroundColor: 'rgb(0, 0, 0)',
    borderRadius: 30,
    padding: 30,
    width: '100%',
    maxWidth: 450,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 30,
    marginBottom: 15,
    borderWidth: 5,
    borderColor: 'rgb(0, 0, 0)',
    overflow: 'hidden',
  },
  inputIcon: {
    padding: 10,
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: 'rgb(0, 0, 0)',
    fontFamily: 'Roboto-Medium',
  },
  eyeIcon: {
    padding: 10,
    paddingRight: 15,
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: 'rgb(0, 0, 0)',
  },
  signupButtonText: {
    color: "rgb(0, 0, 0)",
    fontSize: 16,
    fontWeight: "normal",
    fontFamily: 'Roboto-Medium',
    marginLeft: 10,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "rgb(200, 200, 200)",
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  loginLink: {
    color: "rgb(255, 255, 255)",
    fontSize: 14,
    fontWeight: "bold",
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