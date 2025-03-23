import { StyleSheet, View, ScrollView, ActivityIndicator, StatusBar, SafeAreaView, Animated, Easing } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AttendanceScreen() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attendanceByMonth, setAttendanceByMonth] = useState({});
  const [subjectAttendance, setSubjectAttendance] = useState({});
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAttendance();
    setupBackgroundAnimation();
  }, []);

  const setupBackgroundAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(backgroundAnim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    ).start();
  };

  const backgroundTranslateX = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70]
  });
  
  const backgroundTranslateY = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -45]
  });

  const calculateOverallPercentage = (subjectAttendances) => {
    const subjectPercentages = Object.values(subjectAttendances).map(subject => subject.percentage);
    if (subjectPercentages.length === 0) return 0;
    const sum = subjectPercentages.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / subjectPercentages.length);
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: studentData } = await supabase
        .from('student')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!studentData) return;

      // Fetch subjects first
      const { data: subjects } = await supabase
        .from('subjects')
        .select('*');

      // Fetch attendance for each subject
      const subjectWiseAttendance = {};
      
      for (const subject of subjects) {
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', studentData.id)
          .eq('subject_id', subject.id)
          .order('date', { ascending: false });

        if (attendance) {
          const totalClasses = attendance.length;
          const presentClasses = attendance.filter(record => record.status === 'present').length;
          const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

          subjectWiseAttendance[subject.id] = {
            name: subject.name,
            attendance: attendance,
            percentage: Math.round(percentage),
            totalClasses,
            presentClasses
          };
        }
      }

      setSubjectAttendance(subjectWiseAttendance);
      // Calculate and set overall attendance percentage
      setAttendancePercentage(calculateOverallPercentage(subjectWiseAttendance));
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 75) return '#4CAF50';
    if (percentage >= 65) return '#FFC107';
    return '#F44336';
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  return (
    <Animated.View style={styles.backgroundContainer}>
      <Animated.Image 
        source={require('../../assets/images/connection.jpeg')} 
        style={[
          styles.backgroundImage,
          {
            transform: [
              { translateX: backgroundTranslateX },
              { translateY: backgroundTranslateY }
            ]
          }
        ]}
      />
      
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)','rgba(0, 0, 0, 0.5)','rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeAreaContent}>
            <ThemedText style={styles.headerTitle}>Attendance Record</ThemedText>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <ScrollView 
            style={styles.scrollContainer} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCard}>
              <View style={[styles.percentageCircle, { borderColor: getStatusColor(attendancePercentage) }]}>
                <ThemedText style={[styles.percentageText, { color: getStatusColor(attendancePercentage) }]}>
                  {attendancePercentage}%
                </ThemedText>

              </View>

              <View style={styles.statusBox}>
                <ThemedText style={[styles.statusText, { color: getStatusColor(attendancePercentage) }]}>
                  {attendancePercentage >= 75 ? 'Good Job' : '⚠ Warning'}
                </ThemedText>
                <ThemedText style={styles.statusMessage}>
                  {attendancePercentage < 75 
                    ? 'Minimum 75% attendance required' 
                    : 'Keep up the good work!'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.recordsContainer}>
              {Object.entries(attendanceByMonth).map(([monthYear, records]) => (
                <View key={monthYear} style={styles.monthBlock}>
                  <View style={styles.monthHeader}>
                    <ThemedText style={styles.monthTitle}>{monthYear}</ThemedText>
                  </View>
                  
                  <View style={styles.recordsList}>
                    {records.map((record, index) => (
                      <View key={index} style={styles.recordItem}>
                        <View style={styles.dateSection}>
                          <Ionicons 
                            name={record.status === 'present' ? 'checkmark-circle' : 'close-circle'} 
                            size={24} 
                            color={record.status === 'present' ? '#4CAF50' : '#F44336'} 
                          />
                          <ThemedText style={styles.dateText}>
                            {new Date(record.date).toLocaleDateString('default', { 
                              day: 'numeric',
                              month: 'short'
                            })}
                          </ThemedText>
                        </View>
                        <ThemedText style={[
                          styles.statusBadge,
                          { 
                            backgroundColor: record.status === 'present' ? '#4CAF5033' : '#F4433633',
                            color: record.status === 'present' ? '#4CAF50' : '#F44336'
                          }
                        ]}>
                          {record.status.toUpperCase()}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {Object.entries(subjectAttendance).map(([subjectId, data]) => (
              <View key={subjectId} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <ThemedText style={styles.subjectName}>{data.name}</ThemedText>
                  <View style={[styles.percentageBadge, { backgroundColor: getStatusColor(data.percentage) }]}>
                    <ThemedText style={styles.percentageText}>{data.percentage}%</ThemedText>
                  </View>
                </View>

                <View style={styles.attendanceDetails}>
                  <ThemedText style={styles.detailText}>
                    Present: {data.presentClasses}/{data.totalClasses} classes
                  </ThemedText>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            © Cochin University of Science and Technology
          </ThemedText>
        </View>
      </View>
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
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: 20,
  },
  safeAreaContent: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop:40,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Oswald-Bold',
    padding:10,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  percentageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  percentageText: {
    fontSize: 21,
    fontFamily: 'Oswald-Bold',
    
  },
  totalText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  statusBox: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    marginBottom: 5,
  },
  statusMessage: {
    color: '#fff',
    opacity: 0.8,
    fontFamily: 'Roboto-Medium',
  },
  recordsContainer: {
    marginTop: 10,
  },
  monthBlock: {
    backgroundColor: '#000',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  monthHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
  },
  monthTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
  },
  recordsList: {
    padding: 10,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  footer: {
    padding: 12,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontFamily: 'Oswald-SemiBold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectCard: {
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    color: '#fff',
  },
  percentageBadge: {
    padding: 5,
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
  },
  attendanceDetails: {
    marginBottom: 10,
  },
  detailText: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
  },
});