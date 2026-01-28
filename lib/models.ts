export type Checkpoint = {
  id?: string; // stable string (recommended)
  label?: string; // user-friendly name
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type Cone = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  checkpoints?: Checkpoint[];
  description?: string;
  active: boolean;
};

export type ConeCompletionWrite = {
  coneId: string;
  coneSlug: string;
  coneName: string;
  userId: string;

  completedAt: any;

  deviceLat: number;
  deviceLng: number;
  accuracyMeters: number | null;

  // Legacy / existing field used by the app in multiple places:
  // distance to nearest checkpoint (or fallback)
  distanceMeters: number;

  // New checkpoint details (optional in Firestore, but we write them when completing)
  checkpointId?: string | null;
  checkpointLabel?: string | null;
  checkpointLat?: number | null;
  checkpointLng?: number | null;
  checkpointRadiusMeters?: number | null;
  checkpointDistanceMeters?: number | null;

  reviewRating?: number | null;
  reviewText?: string | null;   
  reviewCreatedAt?: any; 

  shareBonus: boolean;
  shareConfirmed: boolean;
  sharedAt: any;
  sharedPlatform: string | null;
};
