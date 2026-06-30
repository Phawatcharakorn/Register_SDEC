'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
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
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [status, setStatus]             = useState<StatusFilter>('all')
  const [page, setPage]                 = useState(1)
  const [data, setData]                 = useState<AdminApplicationsResponse | null>(null)
  const [loading, setLoading]           = useState(true)

  // Settings modal
  const [showSettings, setShowSettings] = useState(false)
  const [openDate, setOpenDate]         = useState('')
  const [closeDate, setCloseDate]       = useState('')
  const [isOpen, setIsOpen]             = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  // Create admin modal
  const [showCreate, setShowCreate]     = useState(false)
  const [newEmail, setNewEmail]         = useState('')
  const [newPass, setNewPass]           = useState('')
  const [showPass, setShowPass]         = useState(false)
  const [creating, setCreating]         = useState(false)

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

  const openSettingsModal = async () => {
    const res = await fetch('/api/admin/settings')
    if (res.ok) {
      const data = await res.json()
      setOpenDate(data.open_date  ?? '')
      setCloseDate(data.close_date ?? '')
      setIsOpen(data.is_open !== 'false' && data.is_open !== false)
    }
    setShowSettings(true)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open_date: openDate, close_date: closeDate, is_open: isOpen }),
    })
    setSavingSettings(false)
    if (!res.ok) { toast.error('บันทึกไม่สำเร็จ'); return }
    toast.success('อัปเดตการตั้งค่าเรียบร้อยแล้ว')
    setShowSettings(false)
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, password: newPass }),
    })
    const json = await res.json()
    setCreating(false)
    if (!res.ok) {
      toast.error(json.error ?? 'สร้างไม่สำเร็จ')
      return
    }
    toast.success(`สร้าง Admin "${json.email}" เรียบร้อยแล้ว`)
    setShowCreate(false)
    setNewEmail('')
    setNewPass('')
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin')
  }

  return (
    <>
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Admin header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg shadow-sm">
              <Image src="/sdec-logo.jpg" alt="SDEC Logo" fill className="object-cover" sizes="36px" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">
                {userEmail.endsWith('@sdec.admin') ? userEmail.replace('@sdec.admin', '') : userEmail}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openSettingsModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              การรับสมัคร
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ku-green/30 bg-ku-green-50 px-3 py-1.5 text-xs font-semibold text-ku-green hover:bg-ku-green-50/80 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              สร้าง Admin
            </button>
            <button onClick={handleLogout} className="btn-secondary text-xs">
              ออกจากระบบ
            </button>
          </div>
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

    {/* Settings modal */}
    {showSettings && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-base font-bold text-gray-900">ตั้งค่าการรับสมัคร</h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">วันเปิดรับสมัคร</label>
              <input
                type="text"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                placeholder="เช่น 1 กรกฎาคม 2569"
                className="form-input"
                disabled={savingSettings}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">วันปิดรับสมัคร</label>
              <input
                type="text"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                placeholder="เช่น 31 กรกฎาคม 2569"
                className="form-input"
                disabled={savingSettings}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">สถานะการรับสมัคร</label>
              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                disabled={savingSettings}
                className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 transition-all
                  ${isOpen ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <span className={`text-sm font-semibold ${isOpen ? 'text-green-700' : 'text-gray-500'}`}>
                  {isOpen ? 'เปิดรับสมัครอยู่' : 'ปิดรับสมัครแล้ว'}
                </span>
                <div className={`relative h-6 w-11 rounded-full transition-colors ${isOpen ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </button>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                disabled={savingSettings}
                className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={savingSettings}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-ku-green py-2.5 text-sm font-semibold text-white hover:bg-ku-green-600 disabled:opacity-50"
              >
                {savingSettings && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {savingSettings ? 'กำลังบันทึก…' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Create admin modal */}
    {showCreate && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-base font-bold text-gray-900">สร้างบัญชี Admin ใหม่</h3>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Email หรือ Username</label>
              <input
                type="text"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="เช่น ajarn_som หรือ admin@ku.th"
                className="form-input"
                disabled={creating}
              />
              <p className="mt-1 text-xs text-gray-400">ถ้าใส่ username (ไม่มี @) จะ login ด้วย username นั้น</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className="form-input pr-10"
                  disabled={creating}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewEmail(''); setNewPass('') }}
                disabled={creating}
                className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-ku-green py-2.5 text-sm font-semibold text-white hover:bg-ku-green-600 disabled:opacity-50"
              >
                {creating && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {creating ? 'กำลังสร้าง…' : 'สร้างบัญชี'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  )
}
