import { createClient } from '@supabase/supabase-js'

// ⚠️ Copia estos valores desde tu Supabase (Settings → API)
const supabaseUrl = 'https://nliveclsvpsckxmeyzbg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5saXZlY2xzdnBzY2t4bWV5emJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjEwNjEsImV4cCI6MjA3NDI5NzA2MX0.GdNN-jN8ZElfzapWQi-ZL6OUgx0a5fuRsbnPYna-XJI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
