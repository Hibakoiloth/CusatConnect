import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, StatusBar, Animated, Easing } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [circulars, setCirculars] = useState([]);
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCirculars();
    setupBackgroundAnimation();
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
          style={styles.headerWithStatusBar}
        >
          <View style={styles.safeAreaContent}>
            <Text style={styles.title}>CUSATCONNECT</Text>
            <Text style={styles.subtitle}>Explore recent circulars.</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.blackContainer}>
            <ScrollView 
              style={styles.notificationList}
              showsVerticalScrollIndicator={false}
            >
              {circulars.map((circular, index) => (
                <View key={circular.id} style={styles.notificationItem}>
                  <Text style={styles.notificationTitle}>{circular.title}</Text>
                  <Text style={styles.notificationDescription}>
                    {circular.description || 'No description provided.'}
                  </Text>
                  <View style={styles.notificationFooter}>
                    <Text style={styles.dateText}>
                      Published on: {formatDate(circular.created_at)}
                    </Text>
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
            </ScrollView>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © Cochin University of Science and Technology
          </Text>
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
  headerWithStatusBar: {
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: 20,
  },
  safeAreaContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Oswald-Bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  blackContainer: {
    backgroundColor: '#000',
    borderRadius: 30,
    padding: 20,
    flex: 1,
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  notificationTitle: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'Oswald-Bold',
    marginBottom: 8,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Roboto-Medium',
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Roboto-Medium',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  footer: {
    padding: 15,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontFamily: 'Oswald-SemiBold',
    fontSize: 14,
  },
});
