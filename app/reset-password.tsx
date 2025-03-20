import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, SafeAreaView, Animated, Dimensions, Easing, Modal, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
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

export default function ResetPasswordScreen() {
  const { email: initialEmail = '' } = useLocalSearchParams();
  const [email, setEmail] = useState(initialEmail as string);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
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

  // Add state for role selection
  const [selectedRole, setSelectedRole] = useState<string>('student');

  const handleResetPassword = async () => {
    if (!email) {
      showCustomAlert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      
      // First, check if the email exists in the correct role table
      let { data: roleData, error: roleError } = await supabase
        .from(selectedRole === 'student' ? 'student' : 
              selectedRole === 'teacher' ? 'teacher' : 'office_staff')
        .select('email')
        .eq('email', email)
        .single();
      
      if (roleError || !roleData) {
        showCustomAlert(
          'Account Not Found', 
          `No ${selectedRole} account was found with this email address. Please check the email or select a different role.`
        );
        setLoading(false);
        return;
      }
      
      // If email exists in the correct role table, proceed with password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:8081/password-confirm',
      });
      
      if (error) throw error;
      
      setResetSent(true);
      showCustomAlert(
        'Password Reset Email Sent',
        'Check your email for a link to reset your password. If it doesn\'t appear within a few minutes, check your spam folder.',
        [{ text: 'Return to Login', onPress: () => router.push('/login') }]
      );
      
    } catch (error: any) {
      console.error('Reset password error:', error.message);
      showCustomAlert('Failed', error.message);
    } finally {
      setLoading(false);
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
            <Text style={styles.title}>Reset Password</Text>
          </SafeAreaView>
        </LinearGradient>
        
        <View style={styles.content}>
          <View style={styles.blackContainer}>
            <View style={styles.formContainer}>
              <Text style={styles.instructions}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
              {/* Role selection */}
              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Select your role:</Text>
                <View style={styles.roleOptions}>
                  <TouchableOpacity 
                    style={[styles.roleOption, selectedRole === 'student' && styles.selectedRole]}
                    onPress={() => setSelectedRole('student')}
                  >
                    <Text style={[styles.roleText, selectedRole === 'student' && styles.selectedRoleText]}>Student</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.roleOption, selectedRole === 'teacher' && styles.selectedRole]}
                    onPress={() => setSelectedRole('teacher')}
                  >
                    <Text style={[styles.roleText, selectedRole === 'teacher' && styles.selectedRoleText]}>Teacher</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.roleOption, selectedRole === 'office_staff' && styles.selectedRole]}
                    onPress={() => setSelectedRole('office_staff')}
                  >
                    <Text style={[styles.roleText, selectedRole === 'office_staff' && styles.selectedRoleText]}>Office</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
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
                  editable={!resetSent}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.buttonWrapper} 
                onPress={handleResetPassword}
                disabled={loading || resetSent}
              >
                <LinearGradient
                  colors={['rgb(255, 255, 255)', 'rgb(255, 255, 255)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.resetButton}
                >
                  {loading ? (
                    <ActivityIndicator color="rgb(0, 0, 0)" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="key" size={24} color="rgb(0, 0, 0)" style={styles.buttonIcon} />
                      <Text style={styles.resetButtonText}>Reset Password</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
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
  instructions: {
    color: 'rgb(255, 255, 255)',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 30,
    marginBottom: 25,
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
  buttonWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: 'rgb(0, 0, 0)',
  },
  buttonIcon: {
    marginRight: 10,
  },
  resetButtonText: {
    color: "rgb(0, 0, 0)",
    fontSize: 16,
    fontWeight: "normal",
    fontFamily: 'Roboto-Medium',
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
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
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    color: 'rgb(255, 255, 255)',
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'Roboto-Medium',
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: 'rgb(255, 255, 255)',
    borderColor: 'rgb(0, 0, 0)',
  },
  roleText: {
    color: 'rgb(255, 255, 255)',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  selectedRoleText: {
    color: 'rgb(0, 0, 0)',
  },
}); 