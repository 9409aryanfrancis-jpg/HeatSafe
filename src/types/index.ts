export type Language = 'en' | 'ta' | 'hi';

export type UserRole = 'gig_worker' | 'municipal_planner' | 'union_advocate';

export type GigPlatform =
  | 'swiggy'
  | 'zomato'
  | 'zepto'
  | 'blinkit'
  | 'ola'
  | 'uber'
  | 'rapido'
  | 'shadowfax'
  | 'porter'
  | 'independent'
  | 'other';

export type VehicleType = 'two_wheeler' | 'auto' | 'cab' | 'bicycle' | 'walking';

export type TamilNaduCity = 'chennai' | 'madurai' | 'coimbatore' | 'tiruchirappalli' | 'salem';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  platform: GigPlatform;
  vehicle: VehicleType;
  city: TamilNaduCity;
  role: UserRole;
  womenFriendlyOnly: boolean;
  freeOnly: boolean;
  preferredLanguage: Language;
  createdAt: string;
  isGuest: boolean;
}

export type CarePointType = 'toilet' | 'water' | 'shade' | 'ac_rest';

export type FacilityStatus = 'operational' | 'closed' | 'unusable' | 'needs_verification';

export type ShadeQuality = 'dense_trees' | 'covered_shed' | 'indoor_ac' | 'moderate';

export interface CarePoint {
  id: string;
  name: string;
  nameTa: string;
  type: CarePointType;
  lat: number;
  lng: number;
  city: TamilNaduCity;
  address: string;
  addressTa: string;
  isVerified: boolean;
  isFree: boolean;
  womenFriendly: boolean;
  openHours: string;
  avgCleanlinessRating: number;
  avgSafetyRating: number;
  ratingCount: number;
  shadeQuality?: ShadeQuality;
  tags: string[];
  reportedIssuesCount: number;
  status: FacilityStatus;
  createdBy: string;
  createdAt: string;
  lastUpdatedAt: string;
  distanceMeters?: number;
}

export interface UserRating {
  id: string;
  carePointId: string;
  userId: string;
  userName: string;
  userPlatform: string;
  cleanlinessRating: number;
  safetyRating: number;
  tags: string[];
  comment?: string;
  createdAt: string;
}

export type IssueType =
  | 'locked_closed'
  | 'toilet_unusable'
  | 'water_not_working'
  | 'asked_extra_money'
  | 'unsafe_night'
  | 'dirty_smelly'
  | 'other';

export interface FacilityReport {
  id: string;
  carePointId: string;
  userId: string;
  userName: string;
  issueType: IssueType;
  comment: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface RouteOption {
  id: 'heat_safe' | 'fastest';
  name: string;
  nameTa: string;
  travelTimeMinutes: number;
  distanceKm: number;
  heatExposureScore: number; // 0-100 (lower is safer/less exposed)
  carePointsOnRoute: CarePoint[];
  waypoints: [number, number][];
  highlights: string[];
  highlightsTa: string[];
  isRecommended: boolean;
}

export interface LiveAlert {
  id: string;
  type: 'care_point_nearby' | 'heat_warning' | 'hydration_reminder' | 'safety_notice';
  title: string;
  titleTa: string;
  message: string;
  messageTa: string;
  carePoint?: CarePoint;
  distanceMeters?: number;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface CitySummaryStats {
  city: TamilNaduCity;
  totalFacilities: number;
  toiletsCount: number;
  waterPointsCount: number;
  acRestCount: number;
  shadePointsCount: number;
  verifiedPercentage: number;
  avgCleanliness: number;
  avgSafety: number;
  activeReportsCount: number;
  careDesertsCount: number;
}

export interface RealtimeSyncEvent {
  type:
    | 'INIT'
    | 'CARE_POINT_ADDED'
    | 'CARE_POINT_UPDATED'
    | 'RATING_ADDED'
    | 'REPORT_ADDED'
    | 'USER_JOINED'
    | 'HEAT_ADVISORY';
  payload: any;
  timestamp: string;
}
