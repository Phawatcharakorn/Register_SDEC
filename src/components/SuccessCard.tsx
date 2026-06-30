'use client'

import Link from 'next/link'

export interface SuccessData {
  referenceId: string
  fullName:    string
  email:       string
  submittedAt: string   // ISO string
}

const NEXT_STEPS = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l7-3.5m11 3.5l-7-3.5m0 0v-4" />
      </svg>
    ),
    title: 'อีเมลยืนยันถูกส่งแล้ว',
    desc:  'ระบบส่งอีเมลยืนยันไปที่กล่องจดหมายของคุณแล้ว กรุณาตรวจสอบ (รวมถึงโฟลเดอร์ Spam)',
    color: 'text-blue-600',
    bg:    'bg-blue-50',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'ทีมงานกำลังตรวจสอบ',
    desc:  'ทีมงาน SDEC จะพิจารณาใบสมัครและเอกสารของคุณภายใน 7 วันทำการ',
    color: 'text-amber-600',
    bg:    'bg-amber-50',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'รอรับแจ้งผล',
    desc:  'เมื่อทีมงานพิจารณาเสร็จสิ้น คุณจะได้รับอีเมลแจ้งผลการคัดเลือก',
    color: 'text-green-600',
    bg:    'bg-green-50',
  },
]

export default function SuccessCard({ data }: { data: SuccessData }) {
  const dateStr = new Date(data.submittedAt).toLocaleDateString('th-TH', {
    year:   'numeric',
    month:  'long',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-5">

      {/* ── Main success card ──────────────────────────────── */}
      <div className="rounded-2xl border border-green-200 bg-white shadow-card overflow-hidden animate-fade-up">

        {/* Green top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-400" />

        <div className="px-6 py-8 text-center">
          {/* Animated checkmark */}
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-200">
              <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}>
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            ส่งใบสมัครสำเร็จแล้ว!
          </h2>
          <p className="mt-2 text-sm text-gray-500 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            สวัสดี <span className="font-semibold text-gray-700">{data.fullName}</span>{' '}
            ระบบได้รับใบสมัครของคุณเรียบร้อยแล้ว
          </p>

          {/* Info grid */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left">
              <p className="text-xs font-medium text-gray-400">ชื่อผู้สมัคร</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-800 truncate">{data.fullName}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left">
              <p className="text-xs font-medium text-gray-400">วันที่ส่งใบสมัคร</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-800">{dateStr}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left sm:col-span-1">
              <p className="text-xs font-medium text-gray-400">อีเมลที่แจ้งผล</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-800 truncate">{data.email}</p>
            </div>
          </div>

          {/* Reference ID */}
          <div className="mt-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-4 animate-fade-up"
            style={{ animationDelay: '0.3s' }}>
            <p className="text-xs font-medium text-gray-400">เลขที่ใบสมัคร (Reference ID)</p>
            <p className="mt-1 break-all font-mono text-sm font-bold text-gray-800">{data.referenceId}</p>
            <p className="mt-1 text-xs text-gray-400">กรุณาจดหรือบันทึกเลขนี้ไว้สำหรับติดตามสถานะ</p>
          </div>
        </div>
      </div>

      {/* ── Next steps ────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card animate-fade-up"
        style={{ animationDelay: '0.35s' }}>
        <h3 className="mb-4 text-sm font-semibold text-gray-800">ขั้นตอนถัดไป</h3>
        <div className="space-y-3">
          {NEXT_STEPS.map((step, i) => (
            <div key={step.title}
              className="flex items-start gap-4 rounded-xl border border-gray-100 p-4 animate-fade-up"
              style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.bg} ${step.color}`}>
                {step.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{step.desc}</p>
              </div>
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${step.bg} text-xs font-bold ${step.color}`}>
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Action buttons ────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row animate-fade-up" style={{ animationDelay: '0.6s' }}>
        <Link
          href={`/status?q=${data.referenceId}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ku-green px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-ku-green-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          ตรวจสอบสถานะการสมัคร
        </Link>
        <Link
          href="/"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          กลับหน้าหลัก
        </Link>
      </div>

    </div>
  )
}
