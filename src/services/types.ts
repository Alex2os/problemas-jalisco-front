import type { SelectedPhoto } from "./report-media";

export interface ReportInteractions {
  report_id: number;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}

export type ReportStatus =
  | "reportado"
  | "resuelto"
  // Legacy aliases accepted from API responses
  | "en_proceso"
  | "recibido"
  | "en_revision"
  | "reported"
  | "still_present"
  | "resolved";

export interface ReportPhoto {
  id: number;
  url: string;
  display_order?: number;
  created_at?: string;
}

export interface StatusHistoryEntry {
  id: number;
  previous_status: ReportStatus | null;
  status: ReportStatus;
  actor_id: number | null;
  username: string | null;
  changed_at: string;
  version: number;
  source: "created" | "updated" | "backfill";
}

export interface StatusHistoryPage {
  history: StatusHistoryEntry[];
  has_more: boolean;
  next_before_version: number | null;
}

export interface Report {
  id: number;
  folio: string;
  category: string;
  type: string; // alias for category
  title?: string | null;
  description: string;
  latitude: number;
  longitude: number;
  ubication: string; // formatted address string
  address?: string;
  colonia?: string;
  municipality?: string;
  reference?: string;
  photos: ReportPhoto[];
  status: ReportStatus;
  status_updated_at?: string;
  status_version: number;
  can_manage: boolean;
  created_at: string | null;
  user_id: number;
  username: string;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}

export interface ReportDraft {
  step: number;
  title: string;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  colonia: string;
  municipality: string;
  reference: string;
  photos: SelectedPhoto[]; // Prepared uploads, held only while the form is open
  description: string;
  lastUpdated: number;
}

export interface ReportRecommendation {
  report_id: number;
  reason: "nearby_and_related" | "nearby" | "related_category" | "recent";
  distance_km: number | null;
}

export interface RecommendedReportsPage {
  reports: Report[];
  recommendations: ReportRecommendation[];
  has_more: boolean;
  next_offset: number | null;
}

export interface ReportComment {
  id: number;
  user_id: number;
  report_id: number;
  username: string;
  user_comment: string;
  created_at: string | null;
  can_delete: boolean;
}

export interface CommentsPage {
  comments: ReportComment[];
  interactions: ReportInteractions;
  has_more: boolean;
  next_after_id: number | null;
}

export interface CommentCreated {
  comment: ReportComment;
  interactions: ReportInteractions;
}
