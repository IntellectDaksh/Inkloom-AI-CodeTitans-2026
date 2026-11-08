/**
 * Inkloom AI - Database & Storage Module Index
 * Re-exports domain types, seed dataset, persistent store, and Supabase integration helpers.
 */

// Export all domain types, enums, and interfaces
export * from './types';

// Export seed constants, mock dataset, and initialization functions
export * from './seed';

// Export multi-tenant store implementation and Supabase helpers
export * from './store';

import { InkloomStore } from './store';

// Default export: convenient database accessor singleton
export const db = InkloomStore;
export default InkloomStore;
