export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Cv {
  id: string;
  originalFilename: string;
  uploadedAt: string;
  fileType: string;
  fileSizeBytes?: number;
  extractedText?: string;
}

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface MatchJob {
  jobId: string;
  status: JobStatus;
  errorMessage?: string;
  result?: MatchResult;
}

export interface SkillMatch {
  name: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MatchResult {
  matchResultId?: string;
  status?: string;
  matchScore: number;
  threshold?: number;
  summary: string;
  recommendation: string;
  matchedSkills: string[];
  missingSkills: string[];
  weakMatches: { skill: string; note: string }[];
  retailoringOffered?: boolean;
  retailoredCv?: {
    downloadUrl: string;
    expiresAt: string;
    fileSizeKb: number;
    changes: string[];
  };
}

export enum ApplicationStatus {
  SAVED = 'SAVED',
  APPLIED = 'APPLIED',
  PHONE_SCREEN = 'PHONE_SCREEN',
  INTERVIEW = 'INTERVIEW',
  FINAL_ROUND = 'FINAL_ROUND',
  OFFER = 'OFFER',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  matchScore: number;
  jdUrl?: string;
  jdText?: string;
  retailoredCVUrl?: string;
  cvDownloadUrl?: string;
  createdAt: string;
  appliedAt: string;
}

export interface Note {
  id: string;
  content: string;
  noteType: 'GENERAL' | 'INTERVIEW_PREP' | 'RECRUITER_CONTACT' | 'SALARY' | 'FOLLOW_UP';
  createdAt: string;
}

export interface Stats {
  totalApplications: number;
  averageMatchScore: number;
  applicationsLast30Days: number;
  statusBreakdown: Record<string, number>;
}
