export type UserRole = 'talent' | 'company' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted';

export type User = {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  phone?: string;
  address?: string;
  verified: boolean;
  emailVerified: boolean;
  verificationStatus: VerificationStatus;
  stripeId?: string;
  createdAt: string;
  lastLogin: string;
  bio?: string;
  category?: string;
  title?: string;
  followers?: number;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
  facebook?: string;
  web?: string;
  skills?: string[];
  languages?: string[];
  hourlyRate?: number;
  showContactInfo?: boolean;
  // Company specific fields
  companyName?: string;
  ico?: string;
  portfolio?: PortfolioItem[];
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  type: 'image' | 'video' | 'social' | 'project' | 'achievement';
};

export type Project = {
  id: string;
  title: string;
  description: string;
  price?: number;
  currency?: string;
  vat?: number;
  available?: boolean;
  images?: string[];
  category?: string;
  tags?: string[];
  status?: 'active' | 'completed' | 'cancelled';
  ownerId: string;
  published?: boolean;
  featured?: boolean;
  createdAt?: string;
  rating?: number;
  ratingCount?: number;
  // Event specific fields
  eventDate?: string;
  location?: string;
};

export type CollaborationStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'escrow';

export type Collaboration = {
  id: string;
  talentId: string;
  companyId: string;
  projectId: string;
  price: number;
  status: CollaborationStatus;
  paymentProvider?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  escrowAmount?: number;
  escrowReleased: boolean;
};

export type Rating = {
  id: string;
  collaborationId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Message = {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'message' | 'collaboration' | 'payment' | 'rating';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
};

export type Transaction = {
  id: string;
  userId: string;
  collaborationId: string;
  amount: number;
  type: 'income' | 'expense' | 'escrow' | 'release';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
};

export type Contract = {
  id: string;
  contractNumber: string;
  collaborationId: string;
  talentId: string;
  companyId: string;
  projectId: string;
  price: number;
  currency: string;
  vat: number;
  projectDescription: string;
  deliverables: string[];
  deadline: string;
  paymentTerms: string;
  signedAt: string;
  talentSignature: string;
  companySignature: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
};

export type DocumentType = 'id_card' | 'business_license' | 'ico_certificate';

export type KYCDocument = {
  id: string;
  userId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  status: VerificationStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  // Company specific
  ico?: string;
  companyName?: string;
};

export type CollaborationReport = {
  id: string;
  collaborationId: string;
  talentId: string;
  companyId: string;
  projectId: string;
  // Metrics
  postsCount: number;
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  clicks?: number;
  // ROI
  totalCost: number;
  estimatedRevenue?: number;
  roi?: number; // (revenue - cost) / cost * 100
  cpm: number; // Cost per 1000 impressions
  // Timeline
  briefingDate: string;
  publicationDate: string;
  completionDate: string;
  paymentDate?: string;
  createdAt: string;
};

export type TalentAnalytics = {
  userId: string;
  totalCollaborations: number;
  completedCollaborations: number;
  averageRating: number;
  totalReach: number;
  averageEngagementRate: number;
  totalEarnings: number;
  averageCPM: number;
  topCategories: string[];
  badges: TalentBadge[];
  followersGrowth: FollowerData[];
};

export type TalentBadge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
};

export type FollowerData = {
  date: string;
  count: number;
  platform: 'instagram' | 'tiktok' | 'youtube';
};

export type CompanyAnalytics = {
  userId: string;
  totalBudgetSpent: number;
  activeCampaigns: number;
  completedCampaigns: number;
  averageEngagementRate: number;
  averageCompletionTime: number; // days
  totalReach: number;
  averageROI: number;
  topPerformingTalents: {
    userId: string;
    name: string;
    engagementRate: number;
    totalReach: number;
    totalSpent: number;
  }[];
};

export type EventType = 'match' | 'tournament' | 'concert' | 'show' | 'conference' | 'other';

export type Event = {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  venue?: string; // název místa konání
  expectedAttendance?: number; // očekávaná návštěvnost
  tvBroadcast?: boolean; // bude vysíláno v TV
  streamingPlatform?: string; // platforma pro streaming
  advertisingOptions: AdvertisingOption[];
  public: boolean; // visible to companies looking for talent
  createdAt: string;
};

export type AdvertisingOptionType =
  | 'banner' // plachta/banner na místě
  | 'clothing' // logo na oblečení
  | 'social_post' // post na sociálních sítích
  | 'mention' // zmínka během události
  | 'booth' // stánek na místě
  | 'other';

export type AdvertisingOption = {
  id: string;
  type: AdvertisingOptionType;
  description: string;
  price?: number; // cena v CZK (volitelné)
  available: boolean;
};
