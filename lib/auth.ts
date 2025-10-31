import { account, ID } from './appwrite';
import type { Models } from 'appwrite';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user with email and password
 */
export async function register(data: RegisterData): Promise<Models.User<Models.Preferences>> {
  try {
    const user = await account.create({
      userId: ID.unique(),
      email: data.email,
      password: data.password,
      name: data.name
    });
    
    // Automatically log in after registration
    await login({ email: data.email, password: data.password });
    
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Log in with email and password
 */
export async function login(data: LoginData): Promise<Models.Session> {
  try {
    // Check if there's an existing session and delete it first
    try {
      const existingUser = await account.get();
      if (existingUser) {
        // Delete current session before creating a new one
        await account.deleteSession({
          sessionId: 'current'
        });
      }
    } catch (error) {
      // No existing session, continue with login
    }

    const session = await account.createEmailPasswordSession({
      email: data.email,
      password: data.password
    });
    return session;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  try {
    await account.deleteSession({
      sessionId: 'current'
    });
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  } finally {
    // Clear localStorage fallback used in development
    // Appwrite uses 'cookieFallback' key when cookies are not available (e.g., localhost)
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('cookieFallback');
    }
  }
}

/**
 * Get the current logged in user
 */
export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    // User is not logged in
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Delete all sessions for the current user
 * Useful for cleaning up stuck sessions
 */
export async function logoutAllSessions(): Promise<void> {
  try {
    await account.deleteSessions();
  } catch (error) {
    console.error('Logout all sessions error:', error);
    throw error;
  }
}

/**
 * Update the current user's name
 */
export async function updateName(name: string): Promise<Models.User<Models.Preferences>> {
  try {
    const user = await account.updateName({
      name: name
    });
    return user;
  } catch (error) {
    console.error('Update name error:', error);
    throw error;
  }
}

/**
 * Update the current user's password
 */
export async function updatePassword(newPassword: string, oldPassword: string): Promise<Models.User<Models.Preferences>> {
  try {
    const user = await account.updatePassword({
      password: newPassword,
      oldPassword: oldPassword
    });
    return user;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}

/**
 * Delete the current user's account
 */
export async function deleteAccount(): Promise<void> {
  try {
    // First get the user to ensure they're authenticated
    const user = await account.get();
    if (!user) {
      throw new Error('No user logged in');
    }
    
    // Delete all sessions first
    await account.deleteSessions();
    
    // Note: Appwrite doesn't have a client-side method to delete the account
    // This would typically require a server-side function or manual deletion in the console
    console.warn('Account deletion must be done server-side or through Appwrite console');
    throw new Error('Account deletion is not available from client. Please contact support.');
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
}
