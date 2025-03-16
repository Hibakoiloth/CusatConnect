import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';


const supabaseUrl = 'https://ygnogiyptesupksihfyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnbm9naXlwdGVzdXBrc2loZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzIyNzksImV4cCI6MjA1NjcwODI3OX0._044tK7NCQaoC7g27V3pd2k1e9MdW0esBNtZHjmLzB8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
  },
}); 