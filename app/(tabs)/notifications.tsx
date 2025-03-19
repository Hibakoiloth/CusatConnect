import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
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
          {notifications.map((notification, index) => (
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
          ))}
          {notifications.length === 0 && (
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
    fontFamily: 'TTRamillas',
  },
  notificationDate: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'LexendDeca',
  },
  notificationMessage: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'TTRamillas',
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
    fontFamily: 'TTRamillas',
  },
}); 