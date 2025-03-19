import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecordsScreen() {
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return '#4CAF50';
    if (percentage >= 65) return '#FFC107';
    return '#FF5252';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CusatConnect</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Attendance Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.totalAttendance}>
              <Text style={styles.totalAttendanceLabel}>Total Attendance</Text>
              <Text style={[
                styles.totalAttendanceValue,
                { color: getAttendanceColor(85) }
              ]}>
                85%
              </Text>
            </View>
          </View>
          
          <View style={styles.subjectList}>
            <View style={styles.subjectItem}>
              <Text style={styles.subjectName}>Data Structures</Text>
              <Text style={[
                styles.subjectPercentage,
                { color: getAttendanceColor(90) }
              ]}>
                90%
              </Text>
            </View>
            <View style={styles.subjectItem}>
              <Text style={styles.subjectName}>Computer Networks</Text>
              <Text style={[
                styles.subjectPercentage,
                { color: getAttendanceColor(85) }
              ]}>
                85%
              </Text>
            </View>
            <View style={styles.subjectItem}>
              <Text style={styles.subjectName}>Database Management</Text>
              <Text style={[
                styles.subjectPercentage,
                { color: getAttendanceColor(80) }
              ]}>
                80%
              </Text>
            </View>
            <View style={styles.subjectItem}>
              <Text style={styles.subjectName}>Operating Systems</Text>
              <Text style={[
                styles.subjectPercentage,
                { color: getAttendanceColor(75) }
              ]}>
                75%
              </Text>
            </View>
          </View>
        </View>

        {/* Internal Marks Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Internal Marks</Text>
          <View style={styles.marksList}>
            <View style={styles.markItem}>
              <View>
                <Text style={styles.subjectName}>Data Structures</Text>
                <Text style={styles.testName}>Mid Semester Exam</Text>
              </View>
              <Text style={styles.markScore}>85/100</Text>
            </View>
            <View style={styles.markItem}>
              <View>
                <Text style={styles.subjectName}>Computer Networks</Text>
                <Text style={styles.testName}>Assignment 1</Text>
              </View>
              <Text style={styles.markScore}>92/100</Text>
            </View>
            <View style={styles.markItem}>
              <View>
                <Text style={styles.subjectName}>Database Management</Text>
                <Text style={styles.testName}>Quiz 2</Text>
              </View>
              <Text style={styles.markScore}>88/100</Text>
            </View>
            <View style={styles.markItem}>
              <View>
                <Text style={styles.subjectName}>Operating Systems</Text>
                <Text style={styles.testName}>Lab Assignment</Text>
              </View>
              <Text style={styles.markScore}>95/100</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'TTRamillas',
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    fontFamily: 'TTRamillas',
  },
  totalAttendance: {
    alignItems: 'center',
  },
  totalAttendanceLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'TTRamillas',
  },
  totalAttendanceValue: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'LexendDeca',
  },
  subjectList: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  subjectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subjectName: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'TTRamillas',
    fontWeight: '500',
  },
  subjectPercentage: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'LexendDeca',
  },
  marksList: {
    gap: 12,
  },
  markItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  testName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'LexendDeca',
  },
  markScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'LexendDeca',
  },
}); 