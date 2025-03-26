import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, StatusBar, Modal, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [circulars, setCirculars] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [activeCirculars, setActiveCirculars] = useState([]);
  const [showCirculars, setShowCirculars] = useState(false);

  useEffect(() => {
    fetchCirculars();
    fetchStudentProfile();
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

  const fetchStudentProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('student')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      setStudentProfile(data);
    } catch (error) {
      console.error('Error fetching student profile:', error.message);
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local state or data if needed
      setCirculars([]);
      setStudentProfile(null);
      
      // Navigate to the index page
      router.replace('/app/index');
    } catch (error) {
      console.error('Error signing out:', error.message);
      alert('Failed to sign out');
    }
  };

  const handleEdit = () => {
    setEditedProfile(studentProfile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!editedProfile) return;

      const { error } = await supabase
        .from('student')
        .update({
          name: editedProfile.name,
          rollno: editedProfile.rollno,
          department: editedProfile.department,
          semester: editedProfile.semester,
        })
        .eq('email', editedProfile.email);

      if (error) throw error;

      setStudentProfile(editedProfile);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedProfile(studentProfile);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
      <View style={styles.mainContent}>
        <View style={styles.navbar}>
          <ThemedText style={styles.navTitle}>CUSATCONNECT</ThemedText>
          <Pressable 
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <Ionicons name="menu" size={24} color="white" />
          </Pressable>
        </View>

        {/* Dropdown Menu */}
        {showMenu && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowProfile(true);
              }}
            >
              <Ionicons name="person" size={20} color="#000" />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                handleLogout();
              }}
            >
              <Ionicons name="log-out" size={20} color="#000" />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        
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
                <Text style={styles.modalTitle}>Student Profile</Text>
              </View>
              
              {studentProfile ? (
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
                      <Text style={styles.profileValue}>{studentProfile.name}</Text>
                    )}
                  </View>
                  <View style={styles.profileSection}>
                    <Text style={styles.profileLabel}>Roll Number</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.profileInput}
                        value={editedProfile?.rollno}
                        onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, rollno: text} : null)}
                        placeholder="Enter your roll number"
                      />
                    ) : (
                      <Text style={styles.profileValue}>{studentProfile.rollno}</Text>
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
                      <Text style={styles.profileValue}>{studentProfile.department}</Text>
                    )}
                  </View>
                  <View style={styles.profileSection}>
                    <Text style={styles.profileLabel}>Semester</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.profileInput}
                        value={editedProfile?.semester}
                        onChangeText={(text) => setEditedProfile(prev => prev ? {...prev, semester: text} : null)}
                        placeholder="Enter your semester"
                      />
                    ) : (
                      <Text style={styles.profileValue}>{studentProfile.semester}</Text>
                    )}
                  </View>
                  <View style={styles.profileSection}>
                    <Text style={styles.profileLabel}>Email</Text>
                    <Text style={styles.profileValue}>{studentProfile.email}</Text>
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
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
    fontFamily: 'TTRamillas',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
    fontFamily: 'TTRamillas',
  },
  profileContent: {
    padding: 20,
  },
  profileSection: {
    marginBottom: 15,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'TTRamillas',
  },
  profileValue: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'TTRamillas',
  },
  profileInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    fontFamily: 'TTRamillas',
  },
  editButtonContainer: {
    padding: 10,
    backgroundColor: '#9A8174',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'TTRamillas',
  },
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonContainer: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'TTRamillas',
  },
  saveButtonContainer: {
    padding: 10,
    backgroundColor: '#9A8174',
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'TTRamillas',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'TTRamillas',
  },
});
