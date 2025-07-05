import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to get current user's profile
export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('user_id', user.id)
    .single();

  return profile;
};

// Helper function to get current organization
export const getCurrentOrganization = async () => {
  const profile = await getCurrentProfile();
  return profile?.organizations || null;
};

// Helper function to check user permissions
export const hasPermission = async (requiredRole: string[]) => {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  
  return requiredRole.includes(profile.role);
};

// Real-time subscription helpers
export const subscribeToInvoices = (organizationId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('invoices')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'invoices',
      filter: `organization_id=eq.${organizationId}`
    }, callback)
    .subscribe();
};

export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};