import type { ApiError } from '@/types/api'

const STUDENT_ID_RE    = /^\d{10}$/
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png']
const ALLOWED_RESUME_TYPE = 'application/pdf'
const MAX_PHOTO_BYTES  = 2 * 1024 * 1024   // 2 MB
const MAX_RESUME_BYTES = 5 * 1024 * 1024   // 5 MB

// Server-side length limits (match schema.ts)
const MAX_NAME        = 200
const MAX_MAJOR       = 200
const MAX_CORPS       = 100
const MAX_PHONE       = 20
const MAX_EMAIL       = 254   // RFC 5321 max
const MAX_MOTIVATION  = 3000

export interface ApplyFields {
  corps: string
  full_name: string
  student_id: string
  faculty: string
  major: string
  year: number
  gpa: number
  phone: string
  email: string
  motivation: string
  photo: File
  resume: File
}

export async function parseAndValidateApply(
  request: Request,
): Promise<{ fields: ApplyFields } | { errors: ApiError['details'] }> {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return { errors: { _form: 'Invalid multipart/form-data body' } }
  }

  const errors: ApiError['details'] = {}

  const getString = (key: string) => (form.get(key) as string | null)?.trim() ?? ''
  const getFile   = (key: string) => form.get(key) as File | null

  const corps      = getString('corps')
  const full_name  = getString('full_name')
  const student_id = getString('student_id')
  const faculty    = getString('faculty')
  const major      = getString('major')
  const yearRaw    = getString('year')
  const gpaRaw     = getString('gpa')
  const phone      = getString('phone')
  const email      = getString('email')
  const motivation = getString('motivation')
  const photo      = getFile('photo')
  const resume     = getFile('resume')

  // corps
  if (!corps)                     errors.corps = 'Corps selection is required'
  else if (corps.length > MAX_CORPS) errors.corps = 'Corps value is too long'

  // full_name
  if (!full_name)                        errors.full_name = 'Full name is required'
  else if (full_name.length > MAX_NAME)  errors.full_name = 'Full name is too long'

  // faculty
  if (!faculty) errors.faculty = 'Faculty is required'

  // major
  if (!major)                        errors.major = 'Major is required'
  else if (major.length > MAX_MAJOR) errors.major = 'Major name is too long'

  // phone
  if (!phone)                        errors.phone = 'Phone number is required'
  else if (phone.length > MAX_PHONE) errors.phone = 'Phone number is too long'

  // motivation
  if (!motivation)                            errors.motivation = 'Motivation is required'
  else if (motivation.length > MAX_MOTIVATION) errors.motivation = `Motivation must be at most ${MAX_MOTIVATION} characters`

  // student_id: exactly 10 digits
  if (!student_id) {
    errors.student_id = 'Student ID is required'
  } else if (!STUDENT_ID_RE.test(student_id)) {
    errors.student_id = 'Student ID must be exactly 10 digits'
  }

  // email
  if (!email) {
    errors.email = 'Email is required'
  } else if (email.length > MAX_EMAIL) {
    errors.email = 'Email address is too long'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email address'
  }

  // year: 1–4
  const year = parseInt(yearRaw, 10)
  if (!yearRaw) {
    errors.year = 'Year is required'
  } else if (isNaN(year) || year < 1 || year > 4) {
    errors.year = 'Year must be between 1 and 4'
  }

  // GPA: 0.00–4.00
  const gpa = parseFloat(gpaRaw)
  if (!gpaRaw) {
    errors.gpa = 'GPA is required'
  } else if (isNaN(gpa) || gpa < 0 || gpa > 4) {
    errors.gpa = 'GPA must be between 0.00 and 4.00'
  }

  // photo
  if (!photo || photo.size === 0) {
    errors.photo = 'Photo is required'
  } else if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
    errors.photo = 'Photo must be JPEG or PNG'
  } else if (photo.size > MAX_PHOTO_BYTES) {
    errors.photo = 'Photo must be smaller than 2 MB'
  }

  // resume
  if (!resume || resume.size === 0) {
    errors.resume = 'Resume is required'
  } else if (resume.type !== ALLOWED_RESUME_TYPE) {
    errors.resume = 'Resume must be a PDF file'
  } else if (resume.size > MAX_RESUME_BYTES) {
    errors.resume = 'Resume must be smaller than 5 MB'
  }

  if (Object.keys(errors).length > 0) return { errors }

  return {
    fields: {
      corps,
      full_name,
      student_id,
      faculty,
      major,
      year,
      gpa,
      phone,
      email,
      motivation,
      photo: photo!,
      resume: resume!,
    },
  }
}
