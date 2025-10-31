import type { Models } from "appwrite";

/**
 * Team - exported from Appwrite Models
 */
export type Team = Models.Team;

/**
 * Membership - exported from Appwrite Models
 */
export type Membership = Models.Membership;

/**
 * TeamList response from Appwrite
 */
export type TeamList = Models.TeamList;

/**
 * MembershipList response from Appwrite
 */
export type MembershipList = Models.MembershipList;

/**
 * Team Member - extracted member info for display
 * Based on Appwrite Membership model
 */
export interface TeamMember extends Models.Membership {
  // Inherits all Membership properties
}
