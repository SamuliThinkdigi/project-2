import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile & { organizations?: Organization };
}

class AuthService {
  async signUp(email: string, password: string, fullName: string, organizationName: string): Promise<{ success: boolean; data?: AuthUser; error?: string; needsConfirmation?: boolean }> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user' };
      }

      // If user needs email confirmation, return early
      if (!authData.session) {
        return { 
          success: true, 
          needsConfirmation: true,
          error: 'Please check your email and click the confirmation link to complete your registration.'
        };
      }

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          email: email,
        })
        .select()
        .single();

      if (orgError) {
        return { success: false, error: orgError.message };
      }

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: email,
          full_name: fullName,
          organization_id: orgData.id,
          role: 'admin',
        })
        .select()
        .single();

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        profile: { ...profileData, organizations: orgData },
      };

      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; data?: AuthUser; error?: string; needsConfirmation?: boolean }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Check if the error is due to email not being confirmed
        // Handle both the error message and error code
        const isEmailNotConfirmed = 
          authError.message.toLowerCase().includes('email not confirmed') ||
          authError.message.toLowerCase().includes('email_not_confirmed') ||
          (authError as any).code === 'email_not_confirmed';

        if (isEmailNotConfirmed) {
          return { 
            success: false, 
            needsConfirmation: true,
            error: 'Please check your email and click the confirmation link before signing in. If you haven\'t received the email, you can request a new one below.'
          };
        }
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to sign in' };
      }

      // Get profile with organization
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations(*)
        `)
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        profile: profileData,
      };

      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createDemoUser(): Promise<{ success: boolean; data?: AuthUser; error?: string }> {
    try {
      const demoEmail = 'demo@test.com';
      const demoPassword = 'demo123456';
      
      // Try to sign in with demo credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (signInData.user && !signInError) {
        // Demo user exists and sign in successful, get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            organizations(*)
          `)
          .eq('user_id', signInData.user.id)
          .single();

        if (!profileError && profileData) {
          return {
            success: true,
            data: {
              id: signInData.user.id,
              email: signInData.user.email!,
              profile: profileData,
            }
          };
        }
      }

      // If sign in failed, return error with helpful message
      return { 
        success: false, 
        error: signInError?.message || 'Demo-käyttäjä ei ole saatavilla. Tietokanta ei ole vielä alustettu demo-datalla.'
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Demo-kirjautuminen epäonnistui' };
    }
  }

  async resendConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getCurrentUser(): Promise<{ success: boolean; data?: AuthUser; error?: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        return { success: false, error: userError.message };
      }

      if (!user) {
        return { success: false, error: 'No user found' };
      }

      // Get profile with organization
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        profile: profileData,
      };

      return { success: true, data: authUser };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateProfile(updates: Partial<Profile>): Promise<{ success: boolean; data?: Profile; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'No user found' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userResult = await this.getCurrentUser();
        callback(userResult.success ? userResult.data! : null);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();