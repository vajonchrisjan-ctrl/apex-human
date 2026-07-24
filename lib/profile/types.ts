export interface PlatformEntry {
  platform: string;
  handle: string;
  followers: number;
  engagementRate: number;
}

export interface AudienceInfo {
  age?: string;
  geo?: string;
  gender?: string;
}

export interface CreatorProfileData {
  niche: string | null;
  bio: string | null;
  platforms: PlatformEntry[];
  audience: AudienceInfo;
  tone: string | null;
  pastDeals: string | null;
  rateFloor: number | null;
}

export interface CreatorProfileInput {
  niche: string;
  bio: string;
  platforms: PlatformEntry[];
  audience: AudienceInfo;
  tone: string;
  pastDeals: string;
  rateFloor: number | null;
}
