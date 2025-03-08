import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OfficeHomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.push({
      pathname: '/',
      params: {
        replace: true
      }
    });
  };

  const stats = [
    {
      title: 'Total Students',
      value: '2,500',
      icon: 'people',
      color: '#9A8174'
    },
    {
      title: 'Active Circulars',
      value: '12',
      icon: 'document-text',
      color: '#9A8174'
    },
    {
      title: 'Pending Approvals',
      value: '5',
      icon: 'time',
      color: '#9A8174'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.mainContent}>
        <View style={styles.navbar}>
          <Pressable style={styles.menuButton} onPress={handleLogout}>
            <Ionicons name="menu" size={24} color="white" />
          </Pressable>
          <ThemedText style={styles.navTitle}>CUSATCONNECT</ThemedText>
          <Pressable style={styles.menuButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </Pressable>
        </View>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>Office Dashboard.</Text>
        </View>
        
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.icon} size={24} color="white" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle" size={24} color="#9A8174" />
              <Text style={styles.actionText}>New Circular</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="person-add" size={24} color="#9A8174" />
              <Text style={styles.actionText}>Add Student</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="notifications" size={24} color="#9A8174" />
              <Text style={styles.actionText}>Announcements</Text>
            </TouchableOpacity>
          </View>
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
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
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
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'TTRamillas',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'TTRamillas',
  },
  quickActions: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'TTRamillas',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'TTRamillas',
    marginTop: 8,
    textAlign: 'center',
  },
}); 