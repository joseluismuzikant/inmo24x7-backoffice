import { createClient } from '@supabase/supabase-js'

// Check if Supabase Auth is enabled
const isSupabaseAuthEnabled = import.meta.env.VITE_USE_SUPABASE_AUTH === 'true'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create the client if auth is enabled and credentials are present
let supabase = null

if (isSupabaseAuthEnabled) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase Auth is enabled but missing environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY')
  } else {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });

    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
    }
  }
}

// Export supabase client (null if auth is disabled)
export { supabase }

// Authentication functions - only work when auth is enabled
export const signInWithEmail = async (email, password) => {
  if (!isSupabaseAuthEnabled || !supabase) {
    return { 
      data: null, 
      error: new Error('Supabase authentication is disabled') 
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const signOut = async () => {
  if (!isSupabaseAuthEnabled || !supabase) {
    return { error: null }
  }
  
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error }
  }
}

export const getCurrentUser = async () => {
  if (!isSupabaseAuthEnabled || !supabase) {
    // Return a mock user when auth is disabled
    return { 
      user: { id: 'mock-user', email: 'mock@example.com' }, 
      error: null 
    }
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    return { user: null, error }
  }
}

export const onAuthStateChange = (callback) => {
  if (!isSupabaseAuthEnabled || !supabase) {
    // Return a mock subscription that does nothing
    return {
      unsubscribe: () => {}
    }
  }
  
  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return subscription
  } catch (error) {
    console.error('Error setting up auth state change listener:', error)
    return {
      unsubscribe: () => {}
    }
  }
}
