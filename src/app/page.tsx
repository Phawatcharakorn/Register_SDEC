import ApplicationForm from '@/components/forms/ApplicationForm'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Header */}
      <header className="bg-ku-green text-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ku-gold font-bold text-ku-green text-lg leading-none select-none">
              SDEC
            </div>
            <div>
              <p className="text-xs font-medium text-green-300 tracking-wide uppercase">
                มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
              </p>
              <h1 className="text-xl font-bold leading-tight">
                ศูนย์พัฒนานิสิตสู่ความเป็นเลิศ
              </h1>
              <p className="text-sm text-green-300">Student Development and Excellence Center</p>
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
