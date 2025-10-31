/**
 * Appwrite SDK Configuration
 * 
 * Standard Appwrite setup for Next.js
 * Uses NEXT_PUBLIC_ environment variables (safe for client-side)
 */
import { Client, Account, TablesDB, Teams, Databases } from 'appwrite';

export const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const teams = new Teams(client);
export const tablesDB = new TablesDB(client);
export const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const TABLE_IDS = {
    issue: 'issue',
    sprint: 'sprint',
}

export { ID } from 'appwrite';
export default client;