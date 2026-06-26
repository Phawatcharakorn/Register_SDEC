import { z } from 'zod'

const MB = 1024 * 1024

// z.instanceof(File) is safe here — this schema is only used in 'use client' components
const fileSchema = (opts: {
  maxBytes: number
  allowedTypes: string[]
  requiredMsg: string
  sizeMsg: string
  typeMsg: string
}) =>
  z
    .instanceof(File, { message: opts.requiredMsg })
    .refine((f) => f.size > 0, opts.requiredMsg)
    .refine((f) => f.size <= opts.maxBytes, opts.sizeMsg)
    .refine((f) => opts.allowedTypes.includes(f.type), opts.typeMsg)

export const applicationSchema = z.object({
  full_name: z
    .string()
    .min(1, 'กรุณากรอกชื่อ-นามสกุล')
    .max(200, 'ชื่อยาวเกินไป'),

  student_id: z
    .string()
    .regex(/^\d{10}$/, 'รหัสนิสิตต้องเป็นตัวเลข 10 หลัก'),

  faculty: z.string().min(1, 'กรุณาเลือกคณะ'),

  major: z
    .string()
    .min(1, 'กรุณากรอกสาขาวิชา')
    .max(200, 'ชื่อสาขายาวเกินไป'),

  year: z.coerce
    .number({ invalid_type_error: 'กรุณาเลือกชั้นปี' })
    .int()
    .min(1, 'ชั้นปีไม่ถูกต้อง')
    .max(4, 'ชั้นปีไม่ถูกต้อง'),

  gpa: z.coerce
    .number({ invalid_type_error: 'กรุณากรอกเกรดเฉลี่ย' })
    .min(0, 'เกรดเฉลี่ยต้องไม่น้อยกว่า 0')
    .max(4, 'เกรดเฉลี่ยต้องไม่เกิน 4.00'),

  phone: z
    .string()
    .min(9, 'กรุณากรอกเบอร์โทรศัพท์')
    .regex(/^[0-9+\-\s()]+$/, 'รูปแบบเบอร์โทรไม่ถูกต้อง'),

  email: z
    .string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง'),

  motivation: z
    .string()
    .min(50, 'กรุณากรอกแรงจูงใจอย่างน้อย 50 ตัวอักษร')
    .max(3000, 'กรุณากรอกไม่เกิน 3,000 ตัวอักษร'),

  photo: fileSchema({
    maxBytes: 2 * MB,
    allowedTypes: ['image/jpeg', 'image/png'],
    requiredMsg: 'กรุณาอัปโหลดรูปถ่าย',
    sizeMsg: 'รูปถ่ายต้องมีขนาดไม่เกิน 2MB',
    typeMsg: 'รูปถ่ายต้องเป็นไฟล์ .jpg หรือ .png',
  }),

  resume: fileSchema({
    maxBytes: 5 * MB,
    allowedTypes: ['application/pdf'],
    requiredMsg: 'กรุณาอัปโหลด Resume',
    sizeMsg: 'Resume ต้องมีขนาดไม่เกิน 5MB',
    typeMsg: 'Resume ต้องเป็นไฟล์ PDF เท่านั้น',
  }),
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>

export const KU_SRIRACHA_FACULTIES = [
  'คณะวิศวกรรมศาสตร์ศรีราชา',
  'คณะวิทยาการจัดการ',
  'คณะวิทยาศาสตร์ศรีราชา',
  'คณะเศรษฐศาสตร์ ศรีราชา',
  'คณะพาณิชยนาวีนานาชาติ',
  'คณะทรัพยากรและสิ่งแวดล้อม',
] as const
