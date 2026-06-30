'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import FileUpload from '@/components/ui/FileUpload'
import StepIndicator from '@/components/ui/StepIndicator'
import SuccessCard from '@/components/SuccessCard'
import type { Step } from '@/components/ui/StepIndicator'
import type { SuccessData } from '@/components/SuccessCard'
import { applicationSchema, type ApplicationFormValues, KU_SRIRACHA_FACULTIES, CORPS_OPTIONS } from './schema'

const DRAFT_KEY = 'sdec_draft_v1'

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
}

// ─── Corps Picker ─────────────────────────────────────────────────

const CORPS_CONFIG: { value: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: 'Marketing',
    desc: 'สื่อสาร ประชาสัมพันธ์ และการตลาด',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    value: 'Event Organizer',
    desc: 'วางแผนและจัดกิจกรรมโครงการต่างๆ',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'Human Resource Development',
    desc: 'พัฒนาบุคลากรและทรัพยากรมนุษย์',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    value: 'Catering',
    desc: 'จัดการด้านอาหารและการเลี้ยงรับรอง',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    value: 'Student Assistant',
    desc: 'ช่วยงานและสนับสนุนกิจกรรมของ SDEC',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    value: 'อื่นๆ',
    desc: 'ฝ่ายอื่นที่ไม่ได้ระบุในรายการ',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
]

function CorpsPicker({
  selected,
  onSelect,
  onConfirm,
}: {
  selected: string
  onSelect: (v: string) => void
  onConfirm: () => void
}) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-xl font-bold text-gray-900">เลือกฝ่ายที่ต้องการสมัคร</h2>
        <p className="mt-1 text-sm text-gray-500">กรุณาเลือก 1 ฝ่ายก่อนเริ่มกรอกใบสมัคร</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CORPS_CONFIG.map((c) => {
          const isSelected = selected === c.value
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onSelect(c.value)}
              className={`
                flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150
                ${isSelected
                  ? 'border-ku-green bg-ku-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors
                ${isSelected ? 'bg-ku-green text-white' : 'bg-gray-100 text-gray-500'}`}>
                {c.icon}
              </div>
              <div className="min-w-0">
                <p className={`font-semibold leading-tight ${isSelected ? 'text-ku-green' : 'text-gray-800'}`}>
                  {c.value}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{c.desc}</p>
              </div>
              {isSelected && (
                <svg className="ml-auto mt-0.5 h-5 w-5 shrink-0 text-ku-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!selected}
          className="btn-primary"
        >
          เริ่มกรอกใบสมัคร →
        </button>
      </div>
    </div>
  )
}

const STEPS: Step[] = [
  { id: 1, title: 'ข้อมูลส่วนตัว' },
  { id: 2, title: 'ข้อมูลติดต่อ' },
  { id: 3, title: 'เอกสารแนบ' },
  { id: 4, title: 'ตรวจสอบและยืนยัน' },
]

const STEP_FIELDS: Record<number, (keyof ApplicationFormValues)[]> = {
  1: ['full_name', 'student_id', 'faculty', 'major', 'year', 'gpa'],
  2: ['phone', 'email', 'motivation'],
  3: ['photo', 'resume'],
  4: [],
}

// ─── Sidebar ──────────────────────────────────────────────────────

function FormSidebar({ savedAt }: { savedAt: string | null }) {
  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-6 self-start">
      {/* Documents needed */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-ku-green">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          เอกสารที่ต้องเตรียม
        </h3>
        <ul className="space-y-2.5">
          {[
            { text: 'รูปถ่ายหน้าตรง (.jpg / .png, ≤ 2MB)' },
            { text: 'Resume หรือ Portfolio (.pdf, ≤ 5MB)' },
          ].map(({ text }) => (
            <li key={text} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ku-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Qualifications */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-ku-green">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          คุณสมบัติผู้สมัคร
        </h3>
        <ul className="space-y-2">
          {[
            'เป็นนิสิต มก. ศรีราชา',
            'ทุกชั้นปี ทุกคณะ สมัครได้',
            'มีความมุ่งมั่นพัฒนาตนเอง',
            'เข้าร่วมกิจกรรมได้ตามกำหนด',
          ].map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Deadline */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <svg className="h-4 w-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-semibold text-amber-800">วันปิดรับสมัคร</p>
        </div>
        <p className="text-sm font-bold text-amber-900">31 กรกฎาคม 2569</p>
        <p className="mt-1 text-xs text-amber-700">อย่าลืมส่งก่อนหมดเขต!</p>
      </div>

      {savedAt && (
        <p className="text-center text-xs text-gray-400">
          บันทึกอัตโนมัติเมื่อ {savedAt}
        </p>
      )}
    </aside>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────

function Field({
  label,
  error,
  success,
  fullWidth,
  children,
  hint,
}: {
  label: string
  error?: string
  success?: boolean
  fullWidth?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <label className="form-label">{label}</label>
      <div className="relative">
        {children}
        {!error && success && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {error && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
      {hint && !error && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

function inputCls(error?: string, success?: boolean): string {
  const base = 'form-input pr-9'
  if (error)   return `${base} form-input-error`
  if (success) return `${base} form-input-success`
  return base
}

// ─── Review row ───────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="w-36 shrink-0 text-xs font-medium text-gray-400">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card space-y-4">
      {children}
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────

export default function ApplicationForm() {
  const [corpsChosen, setCorpsChosen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [success, setSuccess]         = useState<SuccessData | null>(null)
  const [savedAt, setSavedAt]         = useState<string | null>(null)
  const [confirmed, setConfirmed]     = useState(false)
  const intervalRef                   = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    mode: 'onTouched',
  })

  const watchAll = watch()

  const isOk = (name: keyof ApplicationFormValues) =>
    !!touchedFields[name] && !errors[name]

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw)
      const { savedAt: ts, ...fields } = draft
      reset(fields, { keepDefaultValues: true })
      if (ts) setSavedAt(ts)
    } catch { /* ignore corrupt draft */ }
  }, [reset])

  const saveDraft = useCallback(() => {
    const v = getValues()
    const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      full_name:  v.full_name,
      student_id: v.student_id,
      faculty:    v.faculty,
      major:      v.major,
      year:       v.year,
      gpa:        v.gpa,
      phone:      v.phone,
      email:      v.email,
      motivation: v.motivation,
      savedAt:    now,
    }))
    setSavedAt(now)
  }, [getValues])

  // Auto-save every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(saveDraft, 30_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [saveDraft])

  const handleSaveDraft = () => {
    saveDraft()
    toast.success('บันทึกร่างแล้ว')
  }

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep]
    const valid  = fields.length === 0 || await trigger(fields)
    if (valid) setCurrentStep((s) => Math.min(s + 1, STEPS.length))
  }

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const onSubmit = async (data: ApplicationFormValues) => {
    const formData = new FormData()
    formData.append('corps',      data.corps)
    formData.append('full_name',  data.full_name)
    formData.append('student_id', data.student_id)
    formData.append('faculty',    data.faculty)
    formData.append('major',      data.major)
    formData.append('year',       String(data.year))
    formData.append('gpa',        String(data.gpa))
    formData.append('phone',      data.phone)
    formData.append('email',      data.email)
    formData.append('motivation', data.motivation)
    formData.append('photo',      data.photo)
    formData.append('resume',     data.resume)

    try {
      const res  = await fetch('/api/apply', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) {
        if (res.status === 409) toast.error('รหัสนิสิตนี้มีการสมัครไปแล้ว')
        else toast.error(json.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        return
      }

      localStorage.removeItem(DRAFT_KEY)
      setSuccess({
        referenceId: json.referenceId,
        fullName:    json.fullName,
        email:       json.email,
        submittedAt: json.submittedAt,
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      toast.error('ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต')
    }
  }

  // ── Success ────────────────────────────────────────────────────
  if (success) return <SuccessCard data={success} />

  // ── Corps pre-selection ───────────────────────────────────────
  if (!corpsChosen) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_256px]">
        <div>
          <CorpsPicker
            selected={watchAll.corps ?? ''}
            onSelect={(v) => setValue('corps', v)}
            onConfirm={() => setCorpsChosen(true)}
          />
        </div>
        <FormSidebar savedAt={savedAt} />
      </div>
    )
  }

  // ── Form layout ───────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_256px]">

      {/* ── Main column ──────────────────────────────────────── */}
      <div className="space-y-6 min-w-0">
        {/* Step Indicator */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-card">
          {watchAll.corps && (
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-ku-green-50 border border-ku-green/20 px-2.5 py-0.5 text-xs font-medium text-ku-green">
                ฝ่าย: {watchAll.corps}
              </span>
              <button
                type="button"
                onClick={() => setCorpsChosen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                เปลี่ยน
              </button>
            </div>
          )}
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ── Step 1: ข้อมูลส่วนตัว ──────────────────────── */}
          {currentStep === 1 && (
            <SectionCard>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Field label="ชื่อ-นามสกุล *" error={errors.full_name?.message} success={isOk('full_name')} fullWidth>
                  <input
                    {...register('full_name')}
                    type="text"
                    placeholder="เช่น นายเกษตร ศาสตร์"
                    className={inputCls(errors.full_name?.message, isOk('full_name'))}
                  />
                </Field>

                <Field label="รหัสนิสิต *" error={errors.student_id?.message} success={isOk('student_id')}
                  hint="ตัวเลข 10 หลัก">
                  <input
                    {...register('student_id')}
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0000000000"
                    className={inputCls(errors.student_id?.message, isOk('student_id'))}
                  />
                </Field>

                <Field label="เกรดเฉลี่ยสะสม (GPA) *" error={errors.gpa?.message} success={isOk('gpa')}
                  hint="ระหว่าง 0.00 – 4.00">
                  <input
                    {...register('gpa')}
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    placeholder="0.00"
                    onKeyDown={(e) => {
                      // block e/E/+/-
                      if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
                    }}
                    onBlur={(e) => {
                      // clamp on blur
                      const v = parseFloat(e.target.value)
                      if (!isNaN(v)) {
                        e.target.value = String(Math.min(4, Math.max(0, v)))
                      }
                    }}
                    className={inputCls(errors.gpa?.message, isOk('gpa'))}
                  />
                </Field>

                <Field label="คณะ *" error={errors.faculty?.message} success={isOk('faculty')} fullWidth>
                  <select
                    {...register('faculty')}
                    className={inputCls(errors.faculty?.message, isOk('faculty'))}
                  >
                    <option value="">เลือกคณะ</option>
                    {KU_SRIRACHA_FACULTIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </Field>

                <Field label="สาขาวิชา *" error={errors.major?.message} success={isOk('major')}>
                  <input
                    {...register('major')}
                    type="text"
                    placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                    className={inputCls(errors.major?.message, isOk('major'))}
                  />
                </Field>

                <Field label="ชั้นปี *" error={errors.year?.message} success={isOk('year')}>
                  <select
                    {...register('year')}
                    className={inputCls(errors.year?.message, isOk('year'))}
                  >
                    <option value="">เลือกชั้นปี</option>
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>ปีที่ {y}</option>
                    ))}
                  </select>
                </Field>

              </div>
            </SectionCard>
          )}

          {/* ── Step 2: ข้อมูลติดต่อ ────────────────────────── */}
          {currentStep === 2 && (
            <SectionCard>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Field label="เบอร์โทรศัพท์ *" error={errors.phone?.message} success={isOk('phone')}
                  hint="รูปแบบ 0XX-XXX-XXXX">
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="tel"
                        placeholder="0XX-XXX-XXXX"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                        onBlur={field.onBlur}
                        className={inputCls(errors.phone?.message, isOk('phone'))}
                      />
                    )}
                  />
                </Field>

                <Field label="อีเมล *" error={errors.email?.message} success={isOk('email')}>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="example@ku.th"
                    className={inputCls(errors.email?.message, isOk('email'))}
                  />
                </Field>

                <Field label="เหตุผลที่อยากเข้าร่วม SDEC *" error={errors.motivation?.message}
                  success={isOk('motivation')} fullWidth>
                  <textarea
                    {...register('motivation')}
                    rows={6}
                    placeholder="กรุณาอธิบายเหตุผล แรงจูงใจ และสิ่งที่คาดหวังจากการเข้าร่วม SDEC อย่างน้อย 50 ตัวอักษร"
                    className={`form-input resize-none ${errors.motivation ? 'form-input-error' : isOk('motivation') ? 'form-input-success' : ''}`}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.motivation
                      ? <p className="form-error">{errors.motivation.message}</p>
                      : <span />
                    }
                    <p className={`text-xs ${
                      (watchAll.motivation?.length ?? 0) < 50 ? 'text-gray-400' : 'text-green-600'
                    }`}>
                      {(watchAll.motivation ?? '').length} / 3,000
                    </p>
                  </div>
                </Field>

              </div>
            </SectionCard>
          )}

          {/* ── Step 3: เอกสารแนบ ───────────────────────────── */}
          {currentStep === 3 && (
            <SectionCard>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Controller
                  name="photo"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FileUpload
                      id="photo"
                      accept="image/jpeg,image/png"
                      maxSizeBytes={2 * 1024 * 1024}
                      label="รูปถ่าย *"
                      hint=".jpg, .png ขนาดไม่เกิน 2MB"
                      previewType="image"
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="resume"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FileUpload
                      id="resume"
                      accept="application/pdf"
                      maxSizeBytes={5 * 1024 * 1024}
                      label="Resume / Portfolio *"
                      hint=".pdf ขนาดไม่เกิน 5MB"
                      previewType="document"
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            </SectionCard>
          )}

          {/* ── Step 4: ตรวจสอบและยืนยัน ──────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-4">

              {/* ข้อมูลส่วนตัว */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ku-green-50 text-xs font-bold text-ku-green">1</span>
                    <h3 className="text-sm font-semibold text-gray-800">ข้อมูลส่วนตัว</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-ku-green hover:bg-ku-green-50 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไข
                  </button>
                </div>
                <div className="px-5 py-4 grid grid-cols-1 gap-0 sm:grid-cols-2">
                  <ReviewRow label="ชื่อ-นามสกุล" value={watchAll.full_name} />
                  <ReviewRow label="รหัสนิสิต"    value={watchAll.student_id} />
                  <ReviewRow label="คณะ"          value={watchAll.faculty} />
                  <ReviewRow label="สาขาวิชา"     value={watchAll.major} />
                  <ReviewRow label="ชั้นปี"       value={watchAll.year ? `ปีที่ ${watchAll.year}` : undefined} />
                  <ReviewRow label="เกรดเฉลี่ย"   value={watchAll.gpa ? Number(watchAll.gpa).toFixed(2) : undefined} />
                </div>
              </div>

              {/* ข้อมูลติดต่อ */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ku-green-50 text-xs font-bold text-ku-green">2</span>
                    <h3 className="text-sm font-semibold text-gray-800">ข้อมูลติดต่อ</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-ku-green hover:bg-ku-green-50 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไข
                  </button>
                </div>
                <div className="px-5 py-4">
                  <ReviewRow label="เบอร์โทรศัพท์" value={watchAll.phone} />
                  <ReviewRow label="อีเมล"         value={watchAll.email} />
                </div>
              </div>

              {/* เอกสารแนบ */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ku-green-50 text-xs font-bold text-ku-green">3</span>
                    <h3 className="text-sm font-semibold text-gray-800">เอกสารแนบ</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-ku-green hover:bg-ku-green-50 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไข
                  </button>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3 py-2 border-b border-gray-50">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <svg className="h-4 w-4 text-ku-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">รูปถ่าย</p>
                      <p className="truncate text-sm font-medium text-gray-800">
                        {watchAll.photo?.name ?? <span className="font-normal text-red-400">ยังไม่ได้อัปโหลด</span>}
                      </p>
                    </div>
                    {watchAll.photo && (
                      <svg className="ml-auto h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Resume / Portfolio</p>
                      <p className="truncate text-sm font-medium text-gray-800">
                        {watchAll.resume?.name ?? <span className="font-normal text-red-400">ยังไม่ได้อัปโหลด</span>}
                      </p>
                    </div>
                    {watchAll.resume && (
                      <svg className="ml-auto h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* เหตุผลการสมัคร */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ku-green-50 text-ku-green">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-.707.465l-3.121 1.04 1.04-3.121A2 2 0 019 11z" />
                      </svg>
                    </span>
                    <h3 className="text-sm font-semibold text-gray-800">เหตุผลการสมัคร</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-ku-green hover:bg-ku-green-50 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไข
                  </button>
                </div>
                <div className="px-5 py-4">
                  {watchAll.motivation
                    ? <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{watchAll.motivation}</p>
                    : <p className="text-sm italic text-gray-400">ยังไม่ได้กรอก</p>
                  }
                </div>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 shadow-card transition-colors hover:border-ku-green has-[:checked]:border-ku-green has-[:checked]:bg-ku-green-50">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-ku-green cursor-pointer"
                />
                <span className="text-sm leading-relaxed text-gray-700">
                  ข้าพเจ้าขอรับรองว่าข้อมูลข้างต้น<span className="font-semibold text-gray-900">เป็นความจริงทุกประการ</span>{' '}
                  และยินยอมให้ทีมงาน SDEC ใช้ข้อมูลนี้เพื่อการพิจารณาคัดเลือก
                </span>
              </label>

            </div>
          )}

          {/* ── Navigation ──────────────────────────────────── */}
          <div className="mt-5 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button type="button" onClick={goBack} className="btn-secondary">
                ← ย้อนกลับ
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {/* Save draft visible on steps 1-3 */}
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn-secondary gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  บันทึกร่าง
                </button>
              )}

              {currentStep < STEPS.length ? (
                <button type="button" onClick={goNext} className="btn-primary">
                  ถัดไป →
                </button>
              ) : (
                <div className="flex flex-col items-end gap-1.5">
                  {!confirmed && (
                    <p className="text-xs text-amber-600">กรุณายืนยันความถูกต้องของข้อมูลก่อนส่ง</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || !confirmed}
                    className="btn-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        กำลังส่งใบสมัคร...
                      </>
                    ) : (
                      'ยืนยันและส่งใบสมัคร ✓'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile auto-save status */}
          {savedAt && (
            <p className="mt-3 text-center text-xs text-gray-400 lg:hidden">
              บันทึกอัตโนมัติเมื่อ {savedAt}
            </p>
          )}

        </form>
      </div>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <FormSidebar savedAt={savedAt} />

    </div>
  )
}
