import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function TeacherHomeScreen() {
  const router = useRouter();
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [isAssignmentCardExpanded, setIsAssignmentCardExpanded] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!isValidDate(dueDate)) {
        alert('Please enter a valid date in DD.MM.YYYY format');
        return;
      }

      // Convert date string to ISO format
      const [day, month, year] = dueDate.split('.');
      const isoDate = new Date(year, month - 1, day).toISOString();

      const { error } = await supabase
        .from('assignments')
        .insert([
          {
            title,
            description,
            due_date: isoDate,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      alert('Assignment created successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');
      setShowAssignmentForm(false);
      fetchAssignments(); // Refresh the assignments list
    } catch (error) {
      console.error('Error creating assignment:', error.message);
      alert('Failed to create assignment');
    }
  };

  const isValidDate = (dateString) => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) return false;
    
    const [day, month, year] = dateString.split('.');
    const date = new Date(year, month - 1, day);
    
    return date instanceof Date && !isNaN(date) &&
           date.getDate() == day &&
           date.getMonth() == month - 1 &&
           date.getFullYear() == year;
  };

  const handleDeleteAssignment = async (id) => {
    Alert.alert(
      "Delete Assignment",
      "Are you sure you want to delete this assignment?",
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
              const { error } = await supabase
                .from('assignments')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchAssignments();
            } catch (error) {
              console.error('Error deleting assignment:', error.message);
              alert('Failed to delete assignment');
            }
          }
        }
      ]
    );
  };

  const stats = [
    {
      title: 'Pending Queries',
      value: '5',
      icon: 'help-circle',
      color: '#9A8174'
    },
    {
      title: 'Today\'s Classes',
      value: '3',
      icon: 'calendar',
      color: '#9A8174'
    },
    {
      title: 'Assignments Due',
      value: assignments.length.toString(),
      icon: 'time',
      color: '#9A8174',
      expandable: true
    }
  ];

  const renderAssignmentDetails = () => {
    if (!isAssignmentCardExpanded) return null;

    return (
      <View style={styles.assignmentDetailsContainer}>
        {assignments.map((assignment) => (
          <View key={assignment.id} style={styles.assignmentItem}>
            <View style={styles.assignmentContent}>
              <Text style={styles.assignmentItemTitle}>{assignment.title}</Text>
              <Text style={styles.assignmentItemDesc}>{assignment.description}</Text>
              <Text style={styles.assignmentItemDate}>
                Due: {new Date(assignment.due_date).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteAssignment(assignment.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="close-circle" size={24} color="#FF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

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
          <Text style={styles.headerText}>Hi Teacher.</Text>
        </View>
        
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.statCard,
                stat.expandable && isAssignmentCardExpanded && styles.expandedCard
              ]}
              onPress={() => {
                if (stat.expandable) {
                  setIsAssignmentCardExpanded(!isAssignmentCardExpanded);
                }
              }}
            >
              <View style={styles.statCardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
                  <Ionicons name={stat.icon} size={24} color="white" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              </View>
              {stat.expandable && renderAssignmentDetails()}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowAssignmentForm(true)}
            >
              <Ionicons name="add-circle" size={24} color="#9A8174" />
              <Text style={styles.actionText}>New Assignment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle" size={24} color="#9A8174" />
              <Text style={styles.actionText}>Answer Queries</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="notifications" size={24} color="#9A8174" />
              <Text style={styles.actionText}>Announcements</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Assignment Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAssignmentForm}
        onRequestClose={() => setShowAssignmentForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Assignment</Text>
              <TouchableOpacity 
                onPress={() => setShowAssignmentForm(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Assignment Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter assignment title"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter assignment description"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Due Date (DD.MM.YYYY)</Text>
                <TextInput
                  style={styles.input}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="Enter due date (e.g., 31.12.2024)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!title || !description || !dueDate) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!title || !description || !dueDate}
              >
                <Text style={styles.submitButtonText}>Create Assignment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  expandedCard: {
    minHeight: 200,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    height: '90%',
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
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontFamily: 'TTRamillas',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    fontFamily: 'LexendDeca',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#9A8174',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'LexendDeca',
  },
  assignmentDetailsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  assignmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  assignmentContent: {
    flex: 1,
    marginRight: 10,
  },
  assignmentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'TTRamillas',
    marginBottom: 4,
  },
  assignmentItemDesc: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'TTRamillas',
    marginBottom: 4,
  },
  assignmentItemDate: {
    fontSize: 12,
    color: '#9A8174',
    fontFamily: 'TTRamillas',
  },
  deleteButton: {
    padding: 5,
  },
}); 