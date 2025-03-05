import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';

export default function SelectRole() {
  const router = useRouter();

  const handleRoleSelection = (role) => {
    switch(role) {
      case 'student':
        router.push('/stu_signup');
        break;
      case 'teacher':
        // Add teacher navigation here
        console.log('Teacher selected');
        break;
      case 'office':
        // Add office navigation here
        console.log('Office selected');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Let's get you started</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.roleButton}
            onPress={() => handleRoleSelection('student')}
          >
            <Text style={styles.buttonText}>Student</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.roleButton}
            onPress={() => handleRoleSelection('teacher')}
          >
            <Text style={styles.buttonText}>Teacher</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.roleButton}
            onPress={() => handleRoleSelection('office')}
          >
            <Text style={styles.buttonText}>Office</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Network pattern background */}
      <View style={styles.backgroundPattern} />
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
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  roleButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  backgroundPattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  }
});
