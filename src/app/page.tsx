import ApplicationForm from '@/components/forms/ApplicationForm'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pb-16">
      {/* Header */}
      <header className="relative overflow-hidden bg-ku-green text-white">
        {/* Banner image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/sdec-banner.png')" }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-ku-green/70" />

        <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ku-gold font-bold text-ku-green text-lg leading-none select-none shadow-lg">
              SDEC
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
