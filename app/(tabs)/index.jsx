import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/(auth)/index');
  };

  const notifications = [
    {
      title: 'Supplementary Exam notification',
      description: 'This font is perfect for use in magazines, in the fashion industry, in the branding of premium goods and services.',
      date: '20/12/24'
    },
    {
      title: 'Supplementary Exam notification',
      description: 'This font is perfect for use in magazines, in the fashion industry, in the branding of premium goods and services.',
      date: '20/12/24'
    },
    {
      title: 'Supplementary Exam notification',
      description: 'This font is perfect for use in magazines, in the fashion industry, in the branding of premium goods and services.',
      date: '20/12/24'
    },
    {
      title: 'Supplementary Exam notification',
      description: 'This font is perfect for use in magazines, in the fashion industry, in the branding of premium goods and services.',
      date: '20/12/24'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.mainContent}>
        <View style={styles.navbar}>
          <ThemedText style={styles.navTitle}>CUSATCONNECT</ThemedText>
          <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>Explore recent circulars.</Text>
        </View>
        
        <View style={styles.notificationsContainer}>
          <ScrollView 
            style={styles.notificationBox}
            showsVerticalScrollIndicator={false}
          >
            {notifications.map((notification, index) => (
              <View key={index} style={styles.notificationItem}>
                <ThemedText style={styles.notificationTitle}>{notification.title}</ThemedText>
                <ThemedText style={styles.notificationDescription}>{notification.description}</ThemedText>
                <View style={styles.notificationFooter}>
                  <ThemedText style={styles.notificationDate}>Published on: {notification.date}</ThemedText>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
                {index < notifications.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </ScrollView>
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
  mainContent: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#000',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'TTRamillas',
    letterSpacing: 1,
  },
  menuButton: {
    padding: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: 45,
    fontWeight: '400',
    color: '#fff',
    lineHeight: 48,
    fontFamily: 'TTRamillas',
    letterSpacing: 1,
    textAlign: 'left',
  },
  notificationsContainer: {
    flex: 1,
    marginTop: 10,
  },
  notificationBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationItem: {
    padding: 20,
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000',
    marginBottom: 10,
    fontFamily: 'TTRamillas',
    letterSpacing: 0.3,
  },
  notificationDescription: {
    fontSize: 16,
    color: '#3B3B3B',
    marginBottom: 12,
    fontFamily: 'TTRamillas',
    lineHeight: 22,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'LexendDeca',
    letterSpacing: 0.2,
  },
  viewButton: {
    backgroundColor: '#9A8174',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'LexendDeca',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 16,
  },
});
