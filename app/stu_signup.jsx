import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function StudentSignup() {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit = () => {
    // Handle student ID submission here
    console.log('Student ID submitted');
  };

  const handleGeneratePassword = () => {
    // Handle password generation here
    console.log('Generating password...');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="#8B4513" />
        <Text style={styles.backButtonText}>go back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Student ID Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Student Id:</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#999"
            keyboardType="default"
          />
        </View>

        {/* Generate Password Button */}
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGeneratePassword}
        >
          <Text style={styles.generateButtonText}>Generate Password</Text>
        </TouchableOpacity>

        {/* Message */}
        <Text style={styles.message}>
          The password will be send to your email
        </Text>
      </View>

      {/* Network Pattern Background */}
      <View style={styles.backgroundPattern} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#8B4513',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  backgroundPattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    opacity: 0.1,
    zIndex: -1,
  }
});
