import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Alert, Platform, Modal, Animated, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';

function AttendanceScreen() {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [semesters, setSemesters] = useState(['1', '2', '3', '4', '5', '6', '7', '8']);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);

  const [fontsLoaded] = useFonts({
    'Roboto-Medium': require('../../assets/fonts/Roboto/static/Roboto-Medium.ttf'),
    'Oswald-Bold': require('../../assets/fonts/Oswald/static/Oswald-Bold.ttf'),
  });

  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundAnim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedDepartment && selectedSemester) {
      fetchStudents();
    }
  }, [selectedDepartment, selectedSemester]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('student')
        .select('dept')
        .not('dept', 'is', null);
      
      if (error) throw error;

      // Get unique departments
      const uniqueDepartments = [...new Set(data.map(item => item.dept))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch departments');
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*');
      if (error) throw error;
      setSubjects(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch subjects');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('student')
        .select('*')
        .eq('dept', selectedDepartment)
        .eq('sem', selectedSemester);

      if (error) throw error;
      setStudents(data);
      // Initialize attendance with all students marked absent
      const initialAttendance = {};
      data.forEach(student => {
        initialAttendance[student.id] = 'absent';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch students');
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      Alert.alert('Error', 'Please select a subject');
      return;
    }
    if (!selectedDepartment) {
      Alert.alert('Error', 'Please select a department');
      return;
    }
    if (!selectedSemester) {
      Alert.alert('Error', 'Please select a semester');
      return;
    }

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
        id: `${studentId}_${selectedSubject}_${formattedDate}`, // Composite primary key
        student_id: studentId,
        subject_id: selectedSubject,
        date: formattedDate,
        status: status,
        department: selectedDepartment,
        semester: selectedSemester
      }));

      console.log('Submitting attendance:', attendanceRecords); // Debug log

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords);

      if (error) {
        console.error('Supabase error:', error); // Debug log
        throw error;
      }

      Alert.alert('Success', 'Attendance marked successfully');
      
      // Reset form after successful submission
      setSelectedDate(new Date());
      setSelectedSubject('');
      setAttendance({});
    } catch (error) {
      console.error('Submit error:', error); // Debug log
      Alert.alert('Error', 'Failed to submit attendance. Please try again.');
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === 'android') {
      setShowDatePicker(true);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <Animated.View style={styles.backgroundContainer}>
      <Animated.Image 
        source={require('../../assets/images/connection.jpeg')} 
        style={[
          styles.backgroundImage,
          {
            transform: [
              { translateX: backgroundAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -70]
              })},
              { translateY: backgroundAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -45]
              })}
            ]
          }
        ]}
      />
      <LinearGradient
        colors={['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        <Text style={styles.title}>Attendance Management</Text>

        <View style={styles.blackContainer}>
          <View style={styles.controls}>
            {/* Department Picker */}
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDepartmentPicker(true)}>
              <Text style={styles.buttonText}>
                {selectedDepartment || 'Select Department'}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={showDepartmentPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowDepartmentPicker(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <ScrollView>
                    {departments.map((dept, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.optionItem}
                        onPress={() => {
                          setSelectedDepartment(dept);
                          setSelectedSemester(''); // Reset semester selection
                          setShowDepartmentPicker(false);
                        }}>
                        <Text style={styles.optionText}>{dept}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDepartmentPicker(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Semester Picker */}
            {selectedDepartment && (
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSemesterPicker(true)}>
                <Text style={styles.buttonText}>
                  {selectedSemester ? `Semester ${selectedSemester}` : 'Select Semester'}
                </Text>
              </TouchableOpacity>
            )}

            <Modal
              visible={showSemesterPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowSemesterPicker(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <ScrollView>
                    {semesters.map((sem) => (
                      <TouchableOpacity
                        key={sem}
                        style={styles.optionItem}
                        onPress={() => {
                          setSelectedSemester(sem);
                          setShowSemesterPicker(false);
                        }}>
                        <Text style={styles.optionText}>Semester {sem}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowSemesterPicker(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <TouchableOpacity
              style={styles.subjectButton}
              onPress={() => setShowSubjectPicker(true)}>
              <Text style={styles.buttonText}>
                {selectedSubject ? subjects.find(s => s.id === selectedSubject)?.name : 'Select Subject'}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={showSubjectPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowSubjectPicker(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <ScrollView>
                    {subjects.map(subject => (
                      <TouchableOpacity
                        key={subject.id}
                        style={styles.optionItem}
                        onPress={() => {
                          setSelectedSubject(subject.id);
                          setShowSubjectPicker(false);
                        }}>
                        <Text style={styles.optionText}>{subject.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowSubjectPicker(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={showDatePickerModal}>
              <Text style={styles.dateButtonText}>
                {selectedDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {(showDatePicker || Platform.OS === 'ios') && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </View>
        </View>

        <ScrollView style={styles.studentList}>
          {students.map(student => (
            <View key={student.id} style={styles.studentRow}>
              <Text style={styles.studentName}>{student.name}</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    attendance[student.id] === 'present' && styles.activeButton
                  ]}
                  onPress={() => setAttendance({...attendance, [student.id]: 'present'})}>
                  <Text style={styles.buttonText}>Present</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    attendance[student.id] === 'absent' && styles.activeButton
                  ]}
                  onPress={() => setAttendance({...attendance, [student.id]: 'absent'})}>
                  <Text style={styles.buttonText}>Absent</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Attendance</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    top: -80,
    left: -80,
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    padding: 20,
    fontFamily: 'Oswald-Bold',
    textAlign: 'center',
  },
  blackContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 30,
    padding: 20,
    margin: 10,
  },
  controls: {
    padding: 15,
  },
  pickerButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 5,
    borderColor: '#000',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  subjectButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 5,
    borderColor: '#000',
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#000',
  },
  dateButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  studentList: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 30,
    padding: 15,
    margin: 10,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    width: '45%', // Allocate space for buttons
    justifyContent: 'flex-end',
  },
  statusButton: {
    flex: 1, // Make buttons take equal width
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  activeButton: {
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    textAlign: 'center',
  },
  studentName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    flex: 1, // Take remaining space
    paddingRight: 10,
  },
  submitButton: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#000',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    backgroundColor: '#000',
    borderRadius: 30,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#333',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AttendanceScreen;