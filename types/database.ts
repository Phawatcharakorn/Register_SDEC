// Auto-generated types for the SDEC Application database
// Sync with: npx supabase gen types typescript --project-id <your-project-id> > types/database.ts

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface Application {
  id: string                  // uuid
  created_at: string          // timestamptz (ISO 8601)
  full_name: string
  student_id: string
  faculty: string
  major: string
  year: 1 | 2 | 3 | 4        // int2, constrained 1–4
  gpa: number                 // numeric(3,2), e.g. 3.75
  phone: string
  email: string
  motivation: string
  photo_url: string | null
  resume_url: string | null
  status: ApplicationStatus
  admin_note: string | null
}

/** Shape used when submitting the public application form (no id/created_at/status/admin_note) */
export type ApplicationInsert = Omit<
  Application,
  'id' | 'created_at' | 'status' | 'admin_note'
>

/** Shape used when an admin patches status or adds a note */
export type ApplicationUpdate = Partial<
  Pick<Application, 'status' | 'admin_note' | 'photo_url' | 'resume_url'>
>

// ------------------------------------------------------------------
// Supabase Database type (for use with createClient<Database>())
// ------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      applications: {
        Row: Application
        Insert: Omit<Application, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          status?: ApplicationStatus
          admin_note?: string | null
          photo_url?: string | null
          resume_url?: string | null
        }
        Update: Partial<Application>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
