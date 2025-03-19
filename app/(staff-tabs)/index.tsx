import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, StatusBar, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';

interface Circular {
  id: number;
  title: string;
  description: string;
  file_path: string;
  created_at: string;
  status: string;
}

interface Stat {
  title: string;
  value: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

export default function StaffHomeScreen() {
  const router = useRouter();
  const [showActiveCirculars, setShowActiveCirculars] = useState(false);
  const [activeCirculars, setActiveCirculars] = useState<Circular[]>([]);
  const [circularsCount, setCircularsCount] = useState('0');

  useEffect(() => {
    fetchActiveCircularsCount();
  }, []);

  const fetchActiveCircularsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('circulars')
        .select('id')
        .eq('status', 'active');

      if (error) throw error;
      setCircularsCount(data?.length.toString() || '0');
    } catch (error: any) {
      console.error('Error fetching circulars count:', error.message);
    }
  };

  const fetchActiveCirculars = async () => {
    try {
      const { data, error } = await supabase
        .from('circulars')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveCirculars(data || []);
    } catch (error: any) {
      console.error('Error fetching circulars:', error.message);
    }
  };

  const handleViewPDF = async (filePath: string) => {
    try {
      console.log('Opening file:', filePath);
      
      const { data } = await supabase.storage
        .from('circulars')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        console.error('No public URL returned');
        throw new Error('Could not get file URL');
      }

      console.log('Opening URL:', data.publicUrl);
      await WebBrowser.openBrowserAsync(data.publicUrl);
    } catch (error: any) {
      console.error('Error in handleViewPDF:', error);
      alert('Failed to open PDF: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
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

  const stats: Stat[] = [
    {
      title: 'Active Circulars',
      value: circularsCount,
      iconName: 'document-text-outline',
      color: '#9A8174',
      onPress: () => {
        fetchActiveCirculars();
        setShowActiveCirculars(true);
      }
    },
    {
      title: 'Pending Requests',
      value: '8',
      iconName: 'time-outline',
      color: '#9A8174'
    },
    {
      title: 'Notifications Sent',
      value: '12',
      iconName: 'notifications-outline',
      color: '#9A8174'
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.mainContent}>
        <View style={styles.navbar}>
          <ThemedText style={styles.navTitle}>CUSATCONNECT</ThemedText>
          <Pressable style={styles.menuButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </Pressable>
        </View>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>Hi Staff.</Text>
        </View>
        
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.statCard}
              onPress={stat.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.iconName} size={24} color="white" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="create-outline" size={24} color="#9A8174" />
              <Text style={styles.actionText}>New Notice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="document-text-outline" size={24} color="#9A8174" />
              <Text style={styles.actionText}>Process Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar-outline" size={24} color="#9A8174" />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showActiveCirculars}
          onRequestClose={() => setShowActiveCirculars(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Active Circulars</Text>
                <TouchableOpacity 
                  onPress={() => setShowActiveCirculars(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.circularsList}>
                {activeCirculars.map((circular, index) => (
                  <View key={circular.id} style={styles.circularItem}>
                    <Text style={styles.circularTitle}>{circular.title}</Text>
                    <Text style={styles.circularDescription}>
                      {circular.description || 'No description provided.'}
                    </Text>
                    <View style={styles.circularFooter}>
                      <Text style={styles.circularDate}>
                        Published on: {formatDate(circular.created_at)}
                      </Text>
                      <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => handleViewPDF(circular.file_path)}
                      >
                        <Text style={styles.viewButtonText}>View</Text>
                      </TouchableOpacity>
                    </View>
                    {index < activeCirculars.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
                {activeCirculars.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No active circulars available.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'TTRamillas',
  },
  closeButton: {
    padding: 5,
  },
  circularsList: {
    flex: 1,
  },
  circularItem: {
    marginBottom: 20,
  },
  circularTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'TTRamillas',
  },
  circularDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'TTRamillas',
  },
  circularFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circularDate: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'LexendDeca',
  },
  viewButton: {
    backgroundColor: '#9A8174',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'LexendDeca',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'TTRamillas',
  },
}); 