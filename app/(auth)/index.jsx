import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = (type) => {
    if (type === 'student') {
      router.replace('/(tabs)');
    } else if (type === 'office') {
      router.replace('/(office-tabs)');
    } else if (type === 'teacher') {
      router.replace('/(teacher-tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>CUSATCONNECT</Text>
          <Text style={styles.subtitle}>Welcome to CUSAT</Text>
        </View>

        <View style={styles.loginOptions}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => handleLogin('student')}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="school" size={32} color="#fff" />
              <Text style={styles.buttonText}>Student Login</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => handleLogin('teacher')}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="people" size={32} color="#fff" />
              <Text style={styles.buttonText}>Teacher Login</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => handleLogin('office')}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="business" size={32} color="#fff" />
              <Text style={styles.buttonText}>Office Login</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'TTRamillas',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#9A8174',
    fontFamily: 'TTRamillas',
  },
  loginOptions: {
    gap: 20,
  },
  loginButton: {
    backgroundColor: '#9A8174',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'TTRamillas',
    fontWeight: '500',
  },
}); 