import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://ygnogiyptesupksihfyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnbm9naXlwdGVzdXBrc2loZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzIyNzksImV4cCI6MjA1NjcwODI3OX0._044tK7NCQaoC7g27V3pd2k1e9MdW0esBNtZHjmLzB8';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
