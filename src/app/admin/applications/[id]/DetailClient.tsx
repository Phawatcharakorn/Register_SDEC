'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import StatusBadge from '@/components/ui/StatusBadge'
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton'
import type { AdminApplicationDetailResponse, UpdateApplicationBody } from '@/types/api'
import type { ApplicationDetail } from '@/types/api'

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null) return null
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="w-32 shrink-0 text-xs font-medium text-gray-400">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}

export default function DetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [app, setApp]         = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote]       = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/applications/${id}`)
      if (res.status === 401) { router.push('/admin'); return }
      if (res.status === 404) { router.push('/admin/dashboard'); return }
      if (!res.ok) { toast.error('โหลดข้อมูลไม่ได้'); return }

      const json: AdminApplicationDetailResponse = await res.json()
      setApp(json.data)
      setNote(json.data.admin_note ?? '')
      setLoading(false)
    }
    load()
  }, [id, router])

  const updateStatus = async (status: UpdateApplicationBody['status']) => {
    if (!app) return
    setSaving(true)

    const body: UpdateApplicationBody = { status, admin_note: note || undefined }
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      toast.error('บันทึกไม่สำเร็จ กรุณาลองใหม่')
      setSaving(false)
      return
    }

    const json = await res.json()
    setApp((prev) => prev ? { ...prev, status: json.data.status, admin_note: json.data.admin_note } : prev)
    toast.success(status === 'approved' ? 'อนุมัติเรียบร้อย' : 'ปฏิเสธเรียบร้อย')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <DetailSkeleton />
        </div>
      </div>
    )
  }

  if (!app) return null

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin/dashboard" className="btn-secondary gap-1.5 py-1.5 text-xs">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </Link>
          <span className="text-sm font-medium text-gray-700 truncate">{app.full_name}</span>
          <div className="ml-auto shrink-0">
            <StatusBadge status={app.status} size="sm" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">

        {/* Profile card */}
        <div className="section-card flex flex-col gap-6 sm:flex-row">
          {/* Photo */}
          <div className="relative h-36 w-36 shrink-0 self-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 sm:self-start">
            {app.photo_url ? (
              <Image
                src={app.photo_url}
                alt={app.full_name}
                fill
                className="object-cover"
                sizes="144px"
                priority
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl text-gray-300">
                {app.full_name.charAt(0)}
              </span>
            )}
          </div>

          {/* Basic info */}
          <div className="flex-1 space-y-2.5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{app.full_name}</h2>
              <p className="text-sm text-gray-500">{app.student_id}</p>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="space-y-2">
              {app.corps && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-ku-green-50 border border-ku-green/20 px-3 py-1 mb-1">
                  <svg className="h-3.5 w-3.5 text-ku-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-ku-green">ฝ่าย {app.corps}</span>
                </div>
              )}
              <InfoRow label="คณะ"       value={app.faculty} />
              <InfoRow label="สาขา"      value={app.major} />
              <InfoRow label="ชั้นปี"    value={`ปีที่ ${app.year}`} />
              <InfoRow label="เกรดเฉลี่ย" value={Number(app.gpa).toFixed(2)} />
              <InfoRow label="เบอร์โทร"  value={app.phone} />
              <InfoRow label="อีเมล"     value={app.email} />
              <InfoRow label="วันที่สมัคร" value={dateFormatter.format(new Date(app.created_at))} />
            </div>
          </div>
        </div>

        {/* Motivation */}
        <div className="section-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            เหตุผลที่อยากเข้าร่วม SDEC
          </h3>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
            {app.motivation}
          </p>
        </div>

        {/* Resume */}
        <div className="section-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Resume / Portfolio</h3>
          {app.resume_url ? (
            <a
              href={app.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex gap-2"
            >
              <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
              </svg>
              ดู Resume (PDF)
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <p className="text-sm text-gray-400">ไม่มีไฟล์ Resume</p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            ลิงก์มีอายุ 1 ชั่วโมง หากหมดอายุให้รีโหลดหน้านี้
          </p>
        </div>

        {/* Status update */}
        <div className="section-card space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">อัปเดตสถานะ</h3>

          <div>
            <label className="form-label">หมายเหตุภายใน (สำหรับทีม)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="บันทึกเหตุผลหรือข้อสังเกตสำหรับทีมงาน (ไม่แสดงต่อผู้สมัคร)"
              className="form-input resize-none"
              disabled={saving}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => updateStatus('approved')}
              disabled={saving || app.status === 'approved'}
              className={`
                inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold
                transition-all active:scale-[0.98] disabled:cursor-not-allowed
                ${app.status === 'approved'
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                }
              `}
            >
              {saving ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {app.status === 'approved' ? 'อนุมัติแล้ว' : 'อนุมัติ'}
            </button>

            <button
              onClick={() => updateStatus('rejected')}
              disabled={saving || app.status === 'rejected'}
              className={`
                inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold
                transition-all active:scale-[0.98] disabled:cursor-not-allowed
                ${app.status === 'rejected'
                  ? 'bg-red-100 text-red-700 cursor-default'
                  : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                }
              `}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {app.status === 'rejected' ? 'ปฏิเสธแล้ว' : 'ปฏิเสธ'}
            </button>
          </div>

          {app.admin_note && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs font-medium text-amber-700 mb-1">หมายเหตุที่บันทึกไว้</p>
              <p className="text-sm text-amber-800 whitespace-pre-wrap">{app.admin_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
