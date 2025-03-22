import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, StatusBar, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';

export default function HomeScreen() {
  const [circulars, setCirculars] = useState([]);

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const { data, error } = await supabase
        .from('circulars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCirculars(data || []);
    } catch (error) {
      console.error('Error fetching circulars:', error.message);
    }
  };

  const handleViewPDF = async (filePath) => {
    try {
      console.log('Opening file:', filePath);
      
      const { data, error } = supabase.storage
        .from('circulars')
        .getPublicUrl(filePath);

      if (error) {
        console.error('Error getting public URL:', error.message);
        throw error;
      }

      if (!data?.publicUrl) {
        console.error('No public URL returned');
        throw new Error('Could not get file URL');
      }

      console.log('Opening URL:', data.publicUrl);
      await WebBrowser.openBrowserAsync(data.publicUrl);
    } catch (error) {
      console.error('Error in handleViewPDF:', error);
      alert('Failed to open PDF: ' + error.message);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
      <View style={styles.mainContent}>
        <View style={styles.navbar}>
          <ThemedText style={styles.navTitle}>CUSATCONNECT</ThemedText>
          <Pressable style={styles.menuButton}>
            <Ionicons name="menu" size={24} color="white" />
          </Pressable>
        </View>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>Explore recent circulars.</Text>
        </View>
        
        <View style={styles.notificationsContainer}>
          <ScrollView 
            style={styles.notificationBox}
            showsVerticalScrollIndicator={false}
          >
            {circulars.map((circular, index) => (
              <View key={circular.id} style={styles.notificationItem}>
                <ThemedText style={styles.notificationTitle}>{circular.title}</ThemedText>
                <ThemedText style={styles.notificationDescription}>{circular.description || 'No description provided.'}</ThemedText>
                <View style={styles.notificationFooter}>
                  <ThemedText style={styles.notificationDate}>
                    Published on: {formatDate(circular.created_at)}
                  </ThemedText>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewPDF(circular.file_path)}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
                {index < circulars.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
            {circulars.length === 0 && (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyStateText}>No circulars available.</ThemedText>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(0, 0, 0)',
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
    backgroundColor: 'rgb(45, 30, 20)',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
