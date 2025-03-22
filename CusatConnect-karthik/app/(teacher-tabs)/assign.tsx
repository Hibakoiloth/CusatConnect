import { View, Text, StyleSheet, StatusBar } from 'react-native';
import React from 'react';

function AssignmentScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Text style={styles.title}>Assignments</Text>
      <View style={styles.content}>
        <Text style={styles.text}>Assignment management functionality will be implemented here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: StatusBar.currentHeight,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    padding: 20,
    fontFamily: 'TTRamillas',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'TTRamillas',
  }
});

export default AssignmentScreen;