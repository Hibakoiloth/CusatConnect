import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
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
          <Pressable style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="white" />
          </Pressable>
        </View>
        
        <View style={styles.header}>
          <ThemedText style={styles.headerText}>Explore recent circulars.</ThemedText>
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
    marginTop: StatusBar.currentHeight + 20, // Add extra space at the top
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#000',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 38,
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '100%',
  },
  notificationItem: {
    padding: 16,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
  },
  viewButton: {
    backgroundColor: '#4A3F44',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 16,
  },
});
