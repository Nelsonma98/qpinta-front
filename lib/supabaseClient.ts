import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://uxjprzqkuyrvqclktcat.supabase.co'!,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4anByenFrdXlydnFjbGt0Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyODE3MzEsImV4cCI6MjA4MTg1NzczMX0.qnjRHjcQQvczGZhYyXvtV_ThahD25OdtAjD2B-efwLA'!
)