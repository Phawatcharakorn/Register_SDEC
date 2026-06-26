import type { ApiError } from '@/types/api'

const STUDENT_ID_RE = /^\d{10}$/
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png']
const ALLOWED_RESUME_TYPE = 'application/pdf'
const MAX_PHOTO_BYTES = 2 * 1024 * 1024   // 2 MB
const MAX_RESUME_BYTES = 5 * 1024 * 1024  // 5 MB

export interface ApplyFields {
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

/**
 * Parses and validates multipart/form-data for POST /api/apply.
 * Returns validated fields or a structured error map.
 */
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

  // Required text fields
  if (!full_name)  errors.full_name  = 'Full name is required'
  if (!faculty)    errors.faculty    = 'Faculty is required'
  if (!major)      errors.major      = 'Major is required'
  if (!phone)      errors.phone      = 'Phone number is required'
  if (!motivation) errors.motivation = 'Motivation is required'

  // student_id: exactly 10 digits
  if (!student_id) {
    errors.student_id = 'Student ID is required'
  } else if (!STUDENT_ID_RE.test(student_id)) {
    errors.student_id = 'Student ID must be exactly 10 digits'
  }

  // email
  if (!email) {
    errors.email = 'Email is required'
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

  // GPA: 0.00–4.00, up to 2 decimal places
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
