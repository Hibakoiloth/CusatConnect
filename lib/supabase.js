import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Custom storage for handling web and native environments
const createCustomStorage = () => {
  return {
    async getItem(key) {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.sessionStorage) {
          return window.sessionStorage.getItem(key);
        } else {
          return await AsyncStorage.getItem(key);
        }
      } catch (error) {
        console.error('Storage getItem error:', error);
        return null;
      }
    },
    async setItem(key, value) {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(key, value);
        } else {
          await AsyncStorage.setItem(key, value);
        }
      } catch (error) {
        console.error('Storage setItem error:', error);
      }
    },
    async removeItem(key) {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem(key);
        } else {
          await AsyncStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Storage removeItem error:', error);
      }
    }
  };
};

const supabaseUrl = 'https://ygnogiyptesupksihfyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnbm9naXlwdGVzdXBrc2loZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzIyNzksImV4cCI6MjA1NjcwODI3OX0._044tK7NCQaoC7g27V3pd2k1e9MdW0esBNtZHjmLzB8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createCustomStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
}); 