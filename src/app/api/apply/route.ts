import { createAdminClient } from '@/lib/supabase/server'
import { parseAndValidateApply } from '@/lib/validate-apply'
import { badRequest, conflict, created, serverError, tooManyRequests, withErrorHandler } from '@/lib/api-response'
import { sendConfirmationEmail } from '@/lib/email'
import { rateLimit, getIP } from '@/lib/rate-limit'
import type { ApplyResponse } from '@/types/api'

// 5 submissions per IP per hour — generous for legitimate use, stops spam
const RATE_LIMIT    = 5
const RATE_WINDOW   = 60 * 60 * 1000   // 1 hour

export const POST = withErrorHandler(async (req) => {
  // 0. Rate limit by IP
  const ip = getIP(req)
  if (!rateLimit(`apply:${ip}`, RATE_LIMIT, RATE_WINDOW)) {
    return tooManyRequests('ส่งใบสมัครบ่อยเกินไป กรุณารอ 1 ชั่วโมงแล้วลองใหม่')
  }

  // 1. Parse + validate form
  const result = await parseAndValidateApply(req)
  if ('errors' in result) {
    return badRequest('Validation failed', result.errors)
  }
  const { fields } = result

  const supabase = createAdminClient()

  // 2. Check for duplicate student_id before uploading files
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('student_id', fields.student_id)
    .maybeSingle()

  if (existing) {
    return conflict('รหัสนิสิตนี้มีใบสมัครในระบบแล้ว')
  }

  // 3. Upload photo → applicant-photos/{student_id}/photo.jpg|png
  const photoExt = fields.photo.type === 'image/png' ? 'png' : 'jpg'
  const photoPath = `${fields.student_id}/photo.${photoExt}`

  const { error: photoError } = await supabase.storage
    .from('applicant-photos')
    .upload(photoPath, fields.photo, {
      contentType: fields.photo.type,
      upsert: false,
    })

  if (photoError) {
    console.error('[apply] photo upload failed:', photoError)
    return serverError('Failed to upload photo')
  }

  const { data: { publicUrl: photoUrl } } = supabase.storage
    .from('applicant-photos')
    .getPublicUrl(photoPath)

  // 4. Upload resume → applicant-resumes/{student_id}/resume.pdf
  const resumePath = `${fields.student_id}/resume.pdf`

  const { error: resumeError } = await supabase.storage
    .from('applicant-resumes')
    .upload(resumePath, fields.resume, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (resumeError) {
    await supabase.storage.from('applicant-photos').remove([photoPath])
    console.error('[apply] resume upload failed:', resumeError)
    return serverError('Failed to upload resume')
  }

  // 5. Insert application row
  const { data: application, error: insertError } = await supabase
    .from('applications')
    .insert({
      corps:      fields.corps,
      full_name:  fields.full_name,
      student_id: fields.student_id,
      faculty:    fields.faculty,
      major:      fields.major,
      year:       fields.year as 1 | 2 | 3 | 4,
      gpa:        fields.gpa,
      phone:      fields.phone,
      email:      fields.email,
      motivation: fields.motivation,
      photo_url:  photoUrl,
      resume_url: resumePath,
      status:     'pending',
    })
    .select('id')
    .single()

  if (insertError || !application) {
    await Promise.all([
      supabase.storage.from('applicant-photos').remove([photoPath]),
      supabase.storage.from('applicant-resumes').remove([resumePath]),
    ])
    console.error('[apply] insert failed:', insertError)
    return serverError('Failed to save application')
  }

  const submittedAt = new Date().toISOString()

  void sendConfirmationEmail({
    to:          fields.email,
    fullName:    fields.full_name,
    studentId:   fields.student_id,
    referenceId: application.id,
    submittedAt,
  })

  return created<ApplyResponse>({
    success:     true,
    referenceId: application.id,
    fullName:    fields.full_name,
    email:       fields.email,
    submittedAt,
  })
})
