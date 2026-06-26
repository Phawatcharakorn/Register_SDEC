import type { Application, ApplicationStatus } from '@/types/database'

// ------------------------------------------------------------------
// Shared
// ------------------------------------------------------------------
export interface ApiError {
  error: string
  details?: Record<string, string>  // field-level validation errors
}

// ------------------------------------------------------------------
// POST /api/apply
// ------------------------------------------------------------------
export interface ApplyResponse {
  success: true
  referenceId: string   // uuid of the created application
}

// ------------------------------------------------------------------
// GET /api/admin/applications
// ------------------------------------------------------------------
export interface AdminApplicationsQuery {
  search?: string       // matches full_name or student_id
  status?: ApplicationStatus | 'all'
  page?: number         // 1-based, default 1
  limit?: number        // default 20, max 100
}

export interface ApplicationListItem
  extends Omit<Application, 'motivation' | 'resume_url' | 'admin_note'> {
  photo_url: string | null  // signed URL (1 h expiry) for public display
}

export interface AdminApplicationsResponse {
  data: ApplicationListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ------------------------------------------------------------------
// GET /api/admin/applications/[id]
// ------------------------------------------------------------------
export interface ApplicationDetail extends Application {
  photo_url: string | null    // signed URL (1 h expiry)
  resume_url: string | null   // signed URL (1 h expiry)
}

export interface AdminApplicationDetailResponse {
  data: ApplicationDetail
}

// ------------------------------------------------------------------
// PATCH /api/admin/applications/[id]
// ------------------------------------------------------------------
export interface UpdateApplicationBody {
  status: 'approved' | 'rejected'
  admin_note?: string
}

export interface UpdateApplicationResponse {
  success: true
  data: Pick<Application, 'id' | 'status' | 'admin_note'>
}
