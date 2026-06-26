'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import ApplicantCard from '@/components/ui/ApplicantCard'
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton'
import type { AdminApplicationsResponse } from '@/types/api'
import type { ApplicationStatus } from '@/types/database'

type StatusFilter = ApplicationStatus | 'all'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all',      label: 'ทั้งหมด'        },
  { value: 'pending',  label: 'รอดำเนินการ'    },
  { value: 'approved', label: 'ผ่านการคัดเลือก' },
  { value: 'rejected', label: 'ไม่ผ่าน'        },
]

const LIMIT = 20

export default function DashboardClient({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const [search, setSearch]           = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [status, setStatus]           = useState<StatusFilter>('all')
  const [page, setPage]               = useState(1)
  const [data, setData]               = useState<AdminApplicationsResponse | null>(null)
  const [loading, setLoading]         = useState(true)

  // Debounce search input 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [debouncedSearch, status])

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page:  String(page),
      limit: String(LIMIT),
      status,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    })

    try {
      const res = await fetch(`/api/admin/applications?${params}`)
      if (res.status === 401) { router.push('/admin'); return }
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }, [page, status, debouncedSearch, router])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Admin header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ku-green font-bold text-ku-gold text-xs shadow-sm">
              SDEC
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary text-xs">
            ออกจากระบบ
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Search + stats */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">ใบสมัครทั้งหมด</h2>
            {data && (
              <p className="text-sm text-gray-500">
                พบ {data.total.toLocaleString()} รายการ
              </p>
            )}
          </div>
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือรหัสนิสิต..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`
                whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors
                ${status === tab.value
                  ? 'bg-ku-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <DashboardSkeleton />
        ) : !data || data.data.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-400">ไม่พบข้อมูลใบสมัคร</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data.data.map((app) => (
                <ApplicantCard key={app.id} application={app} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  ← ก่อนหน้า
                </button>
                <span className="text-sm text-gray-500">
                  หน้า {page} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  ถัดไป →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
