import Image from 'next/image'
import ApplicationForm from '@/components/forms/ApplicationForm'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Header */}
      <header className="relative overflow-hidden bg-ku-green text-white">
        {/* White decorative pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="16" fill="none" stroke="white" strokeWidth="1.5"/>
                <circle cx="0"  cy="0"  r="8"  fill="none" stroke="white" strokeWidth="1"/>
                <circle cx="40" cy="0"  r="8"  fill="none" stroke="white" strokeWidth="1"/>
                <circle cx="0"  cy="40" r="8"  fill="none" stroke="white" strokeWidth="1"/>
                <circle cx="40" cy="40" r="8"  fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circles)"/>
          </svg>
        </div>
        {/* Accent orb */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-12 right-32 h-40 w-40 rounded-full bg-white opacity-5" />

        <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Logo image */}
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/sdec-logo.png"
                alt="SDEC Logo"
                fill
                className="object-cover"
                sizes="56px"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-200 tracking-widest uppercase">
                มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
              </p>
              <h1 className="text-2xl font-bold leading-tight">
                ศูนย์พัฒนานิสิตสู่ความเป็นเลิศ
              </h1>
              <p className="text-sm text-blue-200">Student Development and Excellence Center</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form area */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">สมัครเข้าร่วม SDEC</h2>
          <p className="mt-1 text-sm text-gray-500">
            กรุณากรอกข้อมูลให้ครบถ้วนและตรวจสอบความถูกต้องก่อนกดส่งใบสมัคร
          </p>
        </div>

        <ApplicationForm />
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} SDEC · มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
      </footer>
    </main>
  )
}
