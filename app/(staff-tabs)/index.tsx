import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, StatusBar, Modal, Alert, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface StaffProfile {
  id: string;
  name: string;
  email: string;
  department: string;
}

export default function StaffHomeScreen() {
  const router = useRouter();
  const [showActiveCirculars, setShowActiveCirculars] = useState(false);
  const [activeCirculars, setActiveCirculars] = useState<any[]>([]);
  const [circularsCount, setCircularsCount] = useState('0');
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<StaffProfile | null>(null);
  const [showCirculars, setShowCirculars] = useState(false);

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

  const fetchOfficeStaffDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('office_staff')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      setStaffProfile(data);
    } catch (error: any) {
      console.error('Error fetching office staff details:', error.message);
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
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('user-session');
      await AsyncStorage.removeItem('isAuthenticated');
      await AsyncStorage.removeItem('userType');
      router.replace('/login');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
    }
  };

  const handleProfile = async () => {
    await fetchOfficeStaffDetails();
    setShowProfile(true);
    setShowMenu(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const handleDeleteCircular = async (id: number, filePath: string) => {
    Alert.alert(
      "Delete Circular",
      "Are you sure you want to delete this circular?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from storage first
              const { error: storageError } = await supabase.storage
                .from('circulars')
                .remove([filePath]);

              if (storageError) throw storageError;

              // Then delete from database
              const { error: dbError } = await supabase
                .from('circulars')
                .delete()
                .eq('id', id);

              if (dbError) throw dbError;

              // Refresh the circulars list and count
              fetchActiveCirculars();
              fetchActiveCircularsCount();
            } catch (error: any) {
              console.error('Error deleting circular:', error.message);
              alert('Failed to delete circular');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    setEditedProfile(staffProfile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!editedProfile) return;

      const { error } = await supabase
        .from('office_staff')
        .update({
          name: editedProfile.name,
          department: editedProfile.department,
        })
        .eq('email', editedProfile.email);

      if (error) throw error;

      setStaffProfile(editedProfile);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedProfile(staffProfile);
    setIsEditing(false);
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
        <View style={styles.header}>
          <Text style={styles.headerText}>CUSATCONNECT</Text>
          <Pressable style={styles.menuButton} onPress={() => setShowMenu(!showMenu)}>
            <Ionicons name="menu" size={28} color="white" />
          </Pressable>
        </View>

        {/* Dropdown Menu */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.dropdownMenu}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  handleProfile();
                  setShowMenu(false);
                }}
              >
                <Ionicons name="person-outline" size={24} color="#000" />
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  handleLogout();
                  setShowMenu(false);
                }}
              >
                <Ionicons name="log-out-outline" size={24} color="#000" />
                <Text style={styles.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

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
                    <View style={styles.circularHeader}>
                      <Text style={styles.circularTitle}>{circular.title}</Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteCircular(circular.id, circular.file_path)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF4444" />
                      </TouchableOpacity>
                    </View>
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

        {/* Profile Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showProfile}
          onRequestClose={() => setShowProfile(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  onPress={() => setShowProfile(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Office Staff Profile</Text>
              </View>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
              ) : staffProfile ? (
                <ScrollView style={styles.profileContent}>
                  <View style={styles.profileSection}>
                    <Text style={styles.profileLabel}>Name</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.profileInput}
                        value={editedProfile?.name}
                        onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, name: text} : null)}
                        placeholder="Enter your name"
                      />
                    ) : (
                      <Text style={styles.profileValue}>{staffProfile.name}</Text>
                    )}
                  </View>
                  <View style={styles.profileSection}>
                    <Text style={styles.profileLabel}>Department</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.profileInput}
                        value={editedProfile?.department}
                        onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, department: text} : null)}
                        placeholder="Enter your department"
                      />
                    ) : (
                      <Text style={styles.profileValue}>{staffProfile.department}</Text>
                    )}
                  </View>
                  <View style={styles.profileSection}>
                    <Text style={styles.profileLabel}>Email</Text>
                    <Text style={styles.profileValue}>{staffProfile.email}</Text>
                  </View>
                  
                  {!isEditing ? (
                    <TouchableOpacity 
                      onPress={handleEdit}
                      style={styles.editButtonContainer}
                    >
                      <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.editActionsContainer}>
                      <TouchableOpacity 
                        onPress={handleCancel}
                        style={styles.cancelButtonContainer}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={handleSave}
                        style={styles.saveButtonContainer}
                      >
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Failed to load profile information</Text>
                </View>
              )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#fff',
    lineHeight: 48,
    fontFamily: 'TTRamillas',
    letterSpacing: 1,
  },
  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '40%',
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
    fontFamily: 'TTRamillas',
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
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'TTRamillas',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  circularsList: {
    flex: 1,
  },
  circularItem: {
    marginBottom: 20,
  },
  circularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  deleteButton: {
    padding: 5,
  },
  profileContent: {
    flex: 1,
  },
  profileSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'TTRamillas',
  },
  profileValue: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'TTRamillas',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'TTRamillas',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    fontFamily: 'TTRamillas',
  },
  editButtonContainer: {
    backgroundColor: '#9A8174',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'TTRamillas',
  },
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  cancelButtonContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  saveButtonContainer: {
    flex: 1,
    backgroundColor: '#9A8174',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'TTRamillas',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'TTRamillas',
  },
  profileInput: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'TTRamillas',
    borderBottomWidth: 1,
    borderBottomColor: '#9A8174',
    paddingVertical: 5,
  },
}); 