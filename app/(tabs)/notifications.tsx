import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'announcement' | 'assignment' | 'reminder';
  created_at: string;
}

// Temporary static data until the database table is set up
const staticNotifications: Notification[] = [
  {
    id: 1,
    title: 'New Assignment Posted',
    message: 'Data Structures assignment 2 has been posted. Due date: 25/03/2024',
    type: 'assignment',
    created_at: '2024-03-20T10:00:00Z'
  },
  {
    id: 2,
    title: 'Class Cancelled',
    message: 'Computer Networks class scheduled for tomorrow has been cancelled',
    type: 'announcement',
    created_at: '2024-03-19T15:30:00Z'
  },
  {
    id: 3,
    title: 'Upcoming Quiz',
    message: 'Database Management quiz scheduled for next week',
    type: 'reminder',
    created_at: '2024-03-18T09:00:00Z'
  }
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(staticNotifications);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Using static notifications due to:', error.message);
        setNotifications(staticNotifications);
      } else {
        setNotifications(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error.message);
      setNotifications(staticNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'announcement':
        return 'megaphone';
      case 'assignment':
        return 'document-text';
      case 'reminder':
        return 'alarm';
      default:
        return 'notifications';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Notifications</Text>
        </View>
        
        <ScrollView style={styles.notificationsContainer}>
          {isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading notifications...</Text>
            </View>
          ) : notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <View key={notification.id} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons 
                        name={getNotificationIcon(notification.type)} 
                        size={24} 
                        color="#9A8174" 
                      />
                    </View>
                    <View style={styles.notificationInfo}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationDate}>
                        {formatDate(notification.created_at)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                </View>
                {index < notifications.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No notifications available.</Text>
            </View>
          )}
        </ScrollView>
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
  },
  notificationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  notificationItem: {
    marginBottom: 16,
  },
  notificationContent: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0ebe9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Oswald-SemiBold',
  },
  notificationDate: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'LexendDeca',
  },
  notificationMessage: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Roboto-Regular',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Roboto-Regular',
  },
}); 