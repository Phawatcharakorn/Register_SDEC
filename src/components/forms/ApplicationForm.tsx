'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import FileUpload from '@/components/ui/FileUpload'
import StepIndicator from '@/components/ui/StepIndicator'
import type { Step } from '@/components/ui/StepIndicator'
import { applicationSchema, type ApplicationFormValues, KU_SRIRACHA_FACULTIES } from './schema'

// ─── Steps config ─────────────────────────────────────────────────

const STEPS: Step[] = [
  { id: 1, title: 'ข้อมูลส่วนตัว'    },
  { id: 2, title: 'ข้อมูลติดต่อ'     },
  { id: 3, title: 'เอกสารแนบ'        },
  { id: 4, title: 'ตรวจสอบและยืนยัน' },
]

const STEP_FIELDS: Record<number, (keyof ApplicationFormValues)[]> = {
  1: ['full_name', 'student_id', 'faculty', 'major', 'year', 'gpa'],
  2: ['phone', 'email'],
  3: ['photo', 'resume'],
  4: [],
}

// ─── Sub-components ───────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card space-y-4">
      {children}
    </div>
  )
}

function Field({
  label,
  error,
  fullWidth,
  children,
}: {
  label: string
  error?: string
  fullWidth?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="w-36 shrink-0 text-xs font-medium text-gray-400">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [success, setSuccess] = useState<{ referenceId: string } | null>(null)

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    mode: 'onTouched',
  })

  const watchAll = watch()

  // Navigate forward — validate current step fields first
  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep]
    const valid  = fields.length === 0 || await trigger(fields)
    if (valid) setCurrentStep((s) => Math.min(s + 1, STEPS.length))
  }

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const onSubmit = async (data: ApplicationFormValues) => {
    const formData = new FormData()
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

      setSuccess({ referenceId: json.referenceId })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      toast.error('ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต')
    }
  }

  // ── Success ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-green-800">สมัครเรียบร้อยแล้ว!</h2>
        <p className="mt-2 text-sm text-green-700">
          ระบบได้รับใบสมัครของคุณแล้ว ทีมงาน SDEC จะตรวจสอบและแจ้งผลผ่านอีเมลที่ให้ไว้
        </p>
        <div className="mt-6 rounded-lg border border-green-200 bg-white px-6 py-4">
          <p className="text-xs text-gray-500">เลขที่อ้างอิง</p>
          <p className="mt-1 font-mono text-sm font-semibold text-gray-800 break-all">
            {success.referenceId}
          </p>
        </div>
        <p className="mt-4 text-xs text-gray-400">กรุณาเก็บเลขที่อ้างอิงนี้ไว้สำหรับติดตามสถานะ</p>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-card">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ── Step 1: ข้อมูลส่วนตัว ─────────────────────────── */}
        {currentStep === 1 && (
          <SectionCard>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="ชื่อ-นามสกุล *" error={errors.full_name?.message} fullWidth>
                <input {...register('full_name')} type="text" placeholder="เช่น นายเกษตร ศาสตร์"
                  className={`form-input ${errors.full_name ? 'form-input-error' : ''}`} />
              </Field>

              <Field label="รหัสนิสิต *" error={errors.student_id?.message}>
                <input {...register('student_id')} type="text" inputMode="numeric" maxLength={10}
                  placeholder="0000000000"
                  className={`form-input ${errors.student_id ? 'form-input-error' : ''}`} />
              </Field>

              <Field label="เกรดเฉลี่ยสะสม (GPA) *" error={errors.gpa?.message}>
                <input {...register('gpa')} type="number" step="0.01" min="0" max="4" placeholder="0.00"
                  className={`form-input ${errors.gpa ? 'form-input-error' : ''}`} />
              </Field>

              <Field label="คณะ *" error={errors.faculty?.message} fullWidth>
                <select {...register('faculty')}
                  className={`form-input ${errors.faculty ? 'form-input-error' : ''}`}>
                  <option value="">เลือกคณะ</option>
                  {KU_SRIRACHA_FACULTIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </Field>

              <Field label="สาขาวิชา *" error={errors.major?.message}>
                <input {...register('major')} type="text" placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                  className={`form-input ${errors.major ? 'form-input-error' : ''}`} />
              </Field>

              <Field label="ชั้นปี *" error={errors.year?.message}>
                <select {...register('year')}
                  className={`form-input ${errors.year ? 'form-input-error' : ''}`}>
                  <option value="">เลือกชั้นปี</option>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>ปีที่ {y}</option>
                  ))}
                </select>
              </Field>
            </div>
          </SectionCard>
        )}

        {/* ── Step 2: ข้อมูลติดต่อ ──────────────────────────── */}
        {currentStep === 2 && (
          <SectionCard>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="เบอร์โทรศัพท์ *" error={errors.phone?.message}>
                <input {...register('phone')} type="tel" placeholder="08X-XXX-XXXX"
                  className={`form-input ${errors.phone ? 'form-input-error' : ''}`} />
              </Field>

              <Field label="อีเมล *" error={errors.email?.message}>
                <input {...register('email')} type="email" placeholder="example@ku.th"
                  className={`form-input ${errors.email ? 'form-input-error' : ''}`} />
              </Field>

              <Field label="เหตุผลที่อยากเข้าร่วม SDEC *" error={errors.motivation?.message} fullWidth>
                <textarea {...register('motivation')} rows={5}
                  placeholder="กรุณาอธิบายเหตุผล แรงจูงใจ และสิ่งที่คาดหวังจากการเข้าร่วม SDEC อย่างน้อย 50 ตัวอักษร"
                  className={`form-input resize-none ${errors.motivation ? 'form-input-error' : ''}`} />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {(watchAll.motivation ?? '').length} / 3,000
                </p>
              </Field>
            </div>
          </SectionCard>
        )}

        {/* ── Step 3: เอกสารแนบ ─────────────────────────────── */}
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

        {/* ── Step 4: ตรวจสอบและยืนยัน ─────────────────────── */}
        {currentStep === 4 && (
          <SectionCard>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">ตรวจสอบข้อมูลก่อนส่งใบสมัคร</h3>

            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">ข้อมูลส่วนตัว</p>
              <ReviewRow label="ชื่อ-นามสกุล"  value={watchAll.full_name} />
              <ReviewRow label="รหัสนิสิต"      value={watchAll.student_id} />
              <ReviewRow label="คณะ"            value={watchAll.faculty} />
              <ReviewRow label="สาขาวิชา"       value={watchAll.major} />
              <ReviewRow label="ชั้นปี"         value={watchAll.year ? `ปีที่ ${watchAll.year}` : undefined} />
              <ReviewRow label="เกรดเฉลี่ย"     value={watchAll.gpa ? Number(watchAll.gpa).toFixed(2) : undefined} />
            </div>

            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">ช่องทางติดต่อ</p>
              <ReviewRow label="เบอร์โทรศัพท์" value={watchAll.phone} />
              <ReviewRow label="อีเมล"          value={watchAll.email} />
            </div>

            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">เอกสารแนบ</p>
              <ReviewRow label="รูปถ่าย"  value={watchAll.photo?.name ?? 'ยังไม่ได้อัปโหลด'} />
              <ReviewRow label="Resume"   value={watchAll.resume?.name ?? 'ยังไม่ได้อัปโหลด'} />
            </div>

            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">แรงจูงใจ</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-4">
                {watchAll.motivation || <span className="text-gray-400 italic">ยังไม่ได้กรอก</span>}
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center mt-2">
              กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนกดส่งใบสมัคร
            </p>
          </SectionCard>
        )}

        {/* ── Navigation buttons ────────────────────────────── */}
        <div className="mt-5 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button type="button" onClick={goBack} className="btn-secondary">
              ← ย้อนกลับ
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length ? (
            <button type="button" onClick={goNext} className="btn-primary">
              ถัดไป →
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  กำลังส่งใบสมัคร...
                </>
              ) : 'ยืนยันและส่งใบสมัคร ✓'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
