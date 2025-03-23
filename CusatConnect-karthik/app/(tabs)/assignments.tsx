import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [userDept, setUserDept] = useState(null);
  const [userSem, setUserSem] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (userDept && userSem) {
      fetchAssignments();
    }
  }, [userDept, userSem]);

  const fetchUserDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('student')
        .select('dept, sem')
        .eq('email', user.email)
        .single();

      if (error) throw error;

      setUserDept(data.dept);
      setUserSem(data.sem);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user details');
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('department', userDept)
        .eq('semester', userSem)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch assignments');
    }
  };

  const downloadAssignment = async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('assignments')
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds

      if (error) throw error;
      
      await Linking.openURL(data.signedUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to download assignment');
    }
  };

  const renderAssignment = ({ item }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <Text style={styles.assignmentTitle}>{item.title}</Text>
        <Text style={styles.assignmentDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      {item.description && (
        <Text style={styles.assignmentDescription}>{item.description}</Text>
      )}
      
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={() => downloadAssignment(item.file_path)}
      >
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.downloadText}>Download PDF</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assignments</Text>
      <FlatList
        data={assignments}
        renderItem={renderAssignment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
  },
  header: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Oswald-Bold',
    padding: 20,
  },
  listContent: {
    padding: 15,
    gap: 15,
  },
  assignmentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assignmentTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    flex: 1,
  },
  assignmentDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Roboto-Medium',
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 15,
    fontFamily: 'Roboto-Medium',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9A8174',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 8,
  },
  downloadText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
});
