'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface StatusResult {
  id:         string
  full_name:  string
  student_id: string
  status:     'pending' | 'approved' | 'rejected'
  created_at: string
}

// ─── Status config ─────────────────────────────────────────────────

const STATUS_MAP = {
  pending: {
    label: 'รอการพิจารณา',
    bg:    'bg-yellow-50',
    border: 'border-yellow-300',
    text:  'text-yellow-800',
    badgeBg: 'bg-yellow-100',
    dot:   'bg-yellow-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  approved: {
    label: 'ผ่านการคัดเลือก',
    bg:    'bg-green-50',
    border: 'border-green-300',
    text:  'text-green-800',
    badgeBg: 'bg-green-100',
    dot:   'bg-green-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  rejected: {
    label: 'ไม่ผ่านการคัดเลือก',
    bg:    'bg-red-50',
    border: 'border-red-300',
    text:  'text-red-800',
    badgeBg: 'bg-red-100',
    dot:   'bg-red-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
} as const

// ─── Timeline ──────────────────────────────────────────────────────

type TimelineState = 'done' | 'active' | 'pending' | 'rejected'

interface TimelineStep {
  label:    string
  sublabel: string
  state:    TimelineState
}

function getTimeline(status: StatusResult['status']): TimelineStep[] {
  return [
    {
      label:    'ได้รับใบสมัครแล้ว',
      sublabel: 'ระบบได้รับใบสมัครและบันทึกข้อมูลเรียบร้อย',
      state:    'done',
    },
    {
      label:    'ตรวจสอบเอกสาร',
      sublabel: 'ทีมงาน SDEC กำลังพิจารณาใบสมัครและเอกสาร',
      state:    status === 'pending' ? 'active' : 'done',
    },
    {
      label:    status === 'approved' ? 'ผ่านการคัดเลือก'
              : status === 'rejected' ? 'ไม่ผ่านการคัดเลือก'
              : 'ประกาศผล',
      sublabel: status === 'approved' ? 'ยินดีด้วย! คุณได้รับคัดเลือกเข้าร่วม SDEC'
              : status === 'rejected' ? 'ขอบคุณที่สนใจ — ยังมีโอกาสสมัครในรอบถัดไป'
              : 'รอประกาศผลการคัดเลือก',
      state:    status === 'pending'  ? 'pending'
              : status === 'approved' ? 'done'
              : 'rejected',
    },
  ]
}

function Timeline({ status }: { status: StatusResult['status'] }) {
  const steps = getTimeline(status)
  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => {
        const isLast  = i === steps.length - 1
        const isDone  = step.state === 'done'
        const isActive = step.state === 'active'
        const isRejected = step.state === 'rejected'

        return (
          <li key={step.label} className="flex gap-4">
            {/* Spine */}
            <div className="flex flex-col items-center">
              <div className={`
                flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all
                ${isDone    ? 'border-green-500 bg-green-500 text-white'          : ''}
                ${isActive  ? 'border-ku-green bg-white text-ku-green shadow-md animate-pulse' : ''}
                ${isRejected ? 'border-red-500 bg-red-500 text-white'             : ''}
                ${step.state === 'pending' ? 'border-gray-200 bg-gray-50 text-gray-300' : ''}
              `}>
                {isDone ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                ) : isRejected ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                )}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 min-h-[24px] rounded-full ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-6 pt-0.5 min-w-0">
              <p className={`text-sm font-semibold leading-tight
                ${isDone     ? 'text-green-700'  : ''}
                ${isActive   ? 'text-ku-green'   : ''}
                ${isRejected ? 'text-red-700'    : ''}
                ${step.state === 'pending' ? 'text-gray-400' : ''}
              `}>
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{step.sublabel}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ─── Result card ───────────────────────────────────────────────────

function ResultCard({ result }: { result: StatusResult }) {
  const cfg = STATUS_MAP[result.status] ?? STATUS_MAP.pending
  const dateStr = new Date(result.created_at).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`rounded-xl border-2 ${cfg.border} overflow-hidden shadow-card`}>
      {/* Status banner */}
      <div className={`${cfg.bg} px-6 py-4 flex items-center gap-3`}>
        <div className={`${cfg.text}`}>{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${cfg.text} opacity-70`}>สถานะการสมัคร</p>
          <p className={`text-lg font-bold ${cfg.text}`}>{cfg.label}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full ${cfg.badgeBg} ${cfg.border} border px-3 py-1`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot} ${result.status === 'pending' ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
        </span>
      </div>

      <div className="bg-white px-6 py-5 space-y-5">
        {/* Info grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: 'ชื่อ-นามสกุล',    value: result.full_name  },
            { label: 'รหัสนิสิต',        value: result.student_id },
            { label: 'วันที่สมัคร',      value: dateStr           },
            { label: 'เลขที่ใบสมัคร',   value: result.id         },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium text-gray-400">{label}</p>
              <p className={`mt-0.5 text-sm font-semibold text-gray-800 break-all ${label === 'เลขที่ใบสมัคร' ? 'font-mono text-xs' : ''}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Timeline */}
        <div>
          <p className="mb-4 text-sm font-semibold text-gray-700">ความคืบหน้า</p>
          <Timeline status={result.status} />
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white py-14 px-6 text-center shadow-card">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-800">ไม่พบข้อมูลการสมัคร</h3>
      <p className="mt-1 text-sm text-gray-500">
        ไม่พบข้อมูลสำหรับ <span className="font-mono font-medium text-gray-700">{query}</span>
      </p>
      <p className="mt-1 text-xs text-gray-400">
        กรุณาตรวจสอบรหัสนิสิตหรือเลขที่ใบสมัครให้ถูกต้อง
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ku-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-ku-green-600 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
        กลับหน้าสมัคร
      </Link>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────

export default function StatusChecker({ initialQuery }: { initialQuery?: string }) {
  const [query,   setQuery]   = useState(initialQuery ?? '')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<StatusResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const search = async (q = query) => {
    const trimmed = q.trim()
    if (!trimmed) { inputRef.current?.focus(); return }

    setLoading(true)
    setResult(null)
    setNotFound(false)
    setError(null)

    try {
      const res  = await fetch(`/api/status?q=${encodeURIComponent(trimmed)}`)
      const json = await res.json()

      if (res.status === 404) { setNotFound(true); return }
      if (!res.ok) { setError(json.error ?? 'เกิดข้อผิดพลาด'); return }

      setResult(json)
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card">
        <p className="mb-3 text-sm font-medium text-gray-700">
          กรอกรหัสนิสิต (10 หลัก) หรือ เลขที่ใบสมัครที่ได้รับหลังสมัคร
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="เช่น 6400000001 หรือ xxxxxxxx-xxxx-..."
              className="form-input pl-10 pr-4 font-mono"
              autoFocus
            />
          </div>
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="btn-primary shrink-0"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              'ค้นหา'
            )}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      {/* Results */}
      {result   && <ResultCard result={result} />}
      {notFound && <EmptyState query={query} />}
    </div>
  )
}
