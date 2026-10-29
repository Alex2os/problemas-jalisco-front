export interface ReportInteractions {
  report_id: number;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}
export type ReportStatus = "reported" | "still_present" | "resolved";
export interface ReportPhoto {
  id: number;
  url: string;
  display_order: number;
  created_at: string;
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
  photos: ReportPhoto[];
  status: ReportStatus;
  status_updated_at: string;
  status_version: number;
  can_manage: boolean;
  id: number;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  ubication: string;
  created_at: string | null;
  user_id: number;
  username: string;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
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
