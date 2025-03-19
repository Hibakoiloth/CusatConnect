import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Pressable, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';

export default function UploadScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', (error as Error).message);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });
      
      if (!result.canceled) {
        setSelectedFile(result);
      }
    } catch (error) {
      console.error('Error picking file:', (error as Error).message);
    }
  };

  const uploadFile = async (fileUri: string) => {
    try {
      console.log("\n=== CIRCULAR UPLOAD PROCESS START ===");
      console.log("1. Original file details:");
      console.log("- URI:", fileUri);

      // Generate new filename
      const fileName = `circular-${Date.now()}.pdf`;
      console.log("2. Generated filename:", fileName);

      // Create file object for upload
      console.log("3. Creating file for upload...");
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'application/pdf',
        name: fileName
      } as any);
      console.log("- File prepared for upload");

      // Upload to storage
      console.log("4. Uploading to Supabase storage...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('circulars')
        .upload(fileName, formData, {
          contentType: 'multipart/form-data'
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      console.log("5. Storage upload successful:", uploadData);

      // Create database record
      console.log("6. Creating database record...");
      const { data: dbData, error: dbError } = await supabase
        .from('circulars') 
        .insert([
          {
            title: title,
            description: description,
            file_path: fileName,
            status: 'active'
          }
        ])
        .select();

      if (dbError) {
        console.error("Database insert error:", dbError);
        throw dbError;
      }
      console.log("7. Database record created:", dbData);

      console.log("=== UPLOAD PROCESS COMPLETED ===\n");
      alert('Circular uploaded successfully!');
      router.back();

    } catch (error: any) {
      console.error('\n=== UPLOAD ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('=== ERROR END ===\n');
      alert('Upload failed: ' + error.message);
    }
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

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText style={styles.headerText}>Upload Circular</ThemedText>
          </View>

          <View style={styles.uploadContainer}>
            <TextInput
              style={styles.input}
              placeholder="Circular Title"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={styles.uploadBox} 
              onPress={handleFilePick}
            >
              <Ionicons name="cloud-upload" size={48} color="#9A8174" />
              <Text style={styles.uploadText}>
                {selectedFile && !selectedFile.canceled 
                  ? selectedFile.assets[0].name 
                  : 'Tap to select PDF file'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!selectedFile || selectedFile.canceled || !title.trim()) && styles.submitButtonDisabled
            ]}
            onPress={() => {
              if (selectedFile && !selectedFile.canceled) {
                uploadFile(selectedFile.assets[0].uri);
              }
            }}
            disabled={!selectedFile || selectedFile.canceled || !title.trim()}
          >
            <Text style={styles.submitButtonText}>Submit Circular</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 45,
    fontWeight: '400',
    color: '#fff',
    lineHeight: 48,
    fontFamily: 'TTRamillas',
    letterSpacing: 1,
  },
  scrollContent: {
    flex: 1,
  },
  uploadContainer: {
    padding: 20,
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'TTRamillas',
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadBox: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#9A8174',
    borderStyle: 'dashed',
  },
  uploadText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'TTRamillas',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomBar: {
    backgroundColor: '#000',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  submitButton: {
    backgroundColor: '#9A8174',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'TTRamillas',
  },
  bottomPadding: {
    height: 20,
  },
}); 