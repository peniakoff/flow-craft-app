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
    const user = await account.create(
      ID.unique(),
      data.email,
      data.password,
      data.name
    );
    
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
    const session = await account.createEmailPasswordSession(
      data.email,
      data.password
    );
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
    await account.deleteSession('current');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
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
